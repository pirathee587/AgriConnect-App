package com.agriconnect.farmer.rating.service;

import com.agriconnect.farmer.rating.dto.*;
import com.agriconnect.shared.entity.*;
import com.agriconnect.shared.entity.Package;
import com.agriconnect.shared.enums.BookingStatus;
import com.agriconnect.shared.exception.*;
import com.agriconnect.shared.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FarmerRatingService {

    private final RatingRepository  ratingRepository;
    private final BookingRepository bookingRepository;
    private final FarmerRepository  farmerRepository;
    private final AgencyRepository  agencyRepository;
    private final UserRepository    userRepository;

    @Transactional
    public RatingResponse submit(String phone, RatingRequest req) {
        User   user   = getUser(phone);
        Farmer farmer = getFarmer(user.getId());

        Booking booking = bookingRepository.findById(req.getBookingId())
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        if (!booking.getFarmer().getId().equals(farmer.getId()))
            throw new IllegalArgumentException("You can only rate your own bookings.");

        if (booking.getStatus() != BookingStatus.COMPLETED)
            throw new IllegalArgumentException(
                    "Can only rate completed bookings. Current status: " + booking.getStatus());

        if (ratingRepository.existsByBookingIdAndFarmerId(req.getBookingId(), farmer.getId()))
            throw new IllegalArgumentException("You have already rated this booking.");

        Agency agency = booking.getPkg().getAgency();

        Rating rating = ratingRepository.save(Rating.builder()
                .farmer(farmer)
                .agency(agency)
                .booking(booking)
                .stars(req.getStars())
                .comment(req.getComment())
                .build());

        // Recalculate agency average rating
        Double avg = ratingRepository.calculateAvgRating(agency.getId());
        agency.setAverageRating(avg != null ? avg : 0.0);
        agency.setTotalRatings(agency.getTotalRatings() + 1);
        agencyRepository.save(agency);

        return toResponse(rating);
    }

    public List<RatingResponse> getMyRatings(String phone) {
        User   user   = getUser(phone);
        Farmer farmer = getFarmer(user.getId());

        return bookingRepository.findByFarmerIdOrderByCreatedAtDesc(farmer.getId())
                .stream()
                .filter(b -> ratingRepository.existsByBookingIdAndFarmerId(b.getId(), farmer.getId()))
                .map(b -> ratingRepository.findAll().stream()
                        .filter(r -> r.getBooking().getId().equals(b.getId()))
                        .findFirst().map(this::toResponse).orElse(null))
                .filter(r -> r != null)
                .collect(Collectors.toList());
    }

    private User getUser(String phone) {
        return userRepository.findByPhone(phone)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private Farmer getFarmer(Long userId) {
        return farmerRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Farmer not found"));
    }

    private RatingResponse toResponse(Rating r) {
        return RatingResponse.builder()
                .ratingId(r.getId())
                .bookingId(r.getBooking().getId())
                .agentName(r.getAgency().getUser().getName())
                .marketDestination(r.getBooking().getPkg().getMarketDestination())
                .stars(r.getStars())
                .comment(r.getComment())
                .createdAt(r.getCreatedAt())
                .build();
    }
}
