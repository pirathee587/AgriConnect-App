package com.agriconnect.shared.repository;

import com.agriconnect.shared.entity.Rating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface RatingRepository extends JpaRepository<Rating, Long> {
    List<Rating> findByAgencyId(Long agencyId);
    boolean existsByBookingIdAndFarmerId(Long bookingId, Long farmerId);

    @Query("SELECT AVG(r.stars) FROM Rating r WHERE r.agency.id = :agencyId")
    Double calculateAvgRating(@Param("agencyId") Long agencyId);
}