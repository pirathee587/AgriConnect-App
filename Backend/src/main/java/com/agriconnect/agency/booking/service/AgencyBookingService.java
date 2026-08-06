package com.agriconnect.agency.booking.service;

import com.agriconnect.agency.booking.dto.*;
import com.agriconnect.shared.entity.*;
import com.agriconnect.shared.entity.Package;
import com.agriconnect.shared.enums.*;
import com.agriconnect.shared.exception.ResourceNotFoundException;
import com.agriconnect.shared.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AgencyBookingService {

    private final BookingRepository          bookingRepository;
    private final AgencyRepository           agencyRepository;
    private final PackageRepository          packageRepository;
    private final PackageVegetableRepository pvRepository;
    private final UserRepository             userRepository;

    public List<AgencyBookingResponse> getAllBookings(String phone) {
        Agency agency = getAgency(phone);
        return bookingRepository.findByPkgAgencyId(agency.getId())
                .stream().map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<AgencyBookingResponse> getPendingBookings(String phone) {
        Agency agency = getAgency(phone);
        return bookingRepository
                .findByAgencyAndStatus(agency.getId(), BookingStatus.CONFIRMED)
                .stream().map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<AgencyBookingResponse> getBookingsByPackage(String phone, Long packageId) {
        Agency agency = getAgency(phone);
        Package pkg = packageRepository.findById(packageId)
                .orElseThrow(() -> new ResourceNotFoundException("Package not found"));

        if (!pkg.getAgency().getId().equals(agency.getId()))
            throw new IllegalArgumentException("This package does not belong to you.");

        return bookingRepository.findByPkgId(packageId)
                .stream().map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public AgencyBookingResponse approveBooking(String phone, Long bookingId) {
        Booking booking = verifyOwnership(phone, bookingId);

        if (booking.getStatus() != BookingStatus.CONFIRMED)
            throw new IllegalArgumentException(
                    "Only CONFIRMED bookings can be approved. Current: " +
                            booking.getStatus());

        booking.setStatus(BookingStatus.AGENT_APPROVED);
        bookingRepository.save(booking);

        System.out.println(">>> SMS to farmer " +
                booking.getFarmer().getUser().getPhone() +
                ": Your booking for " + booking.getVegetableName() +
                " is approved by agency " +
                booking.getPkg().getAgency().getUser().getName() +
                ". Pickup: " + booking.getPkg().getPickupWindowStart());

        return toResponse(booking);
    }

    @Transactional
    public AgencyBookingResponse rejectBooking(String phone, Long bookingId, String reason) {
        Booking booking = verifyOwnership(phone, bookingId);

        if (booking.getStatus() == BookingStatus.PICKED_UP ||
                booking.getStatus() == BookingStatus.DELIVERED  ||
                booking.getStatus() == BookingStatus.COMPLETED)
            throw new IllegalArgumentException(
                    "Cannot reject a booking in status: " + booking.getStatus());

        Package pkg = booking.getPkg();
        pkg.setRemainingCapacityKg(pkg.getRemainingCapacityKg() + booking.getWeightKg());
        if (pkg.getStatus() == PackageStatus.FULL)
            pkg.setStatus(PackageStatus.OPEN);
        packageRepository.save(pkg);

        pvRepository.findByPkgId(pkg.getId()).stream()
                .filter(v -> v.getVegetableName().equalsIgnoreCase(booking.getVegetableName()))
                .findFirst().ifPresent(v -> {
                    v.setRemainingKg(v.getRemainingKg() + booking.getWeightKg());
                    pvRepository.save(v);
                });

        booking.setStatus(BookingStatus.AGENT_REJECTED);
        booking.setCancelReason(reason);
        bookingRepository.save(booking);

        System.out.println(">>> SMS to farmer " +
                booking.getFarmer().getUser().getPhone() +
                ": Booking rejected. Reason: " + reason);

        return toResponse(booking);
    }

    @Transactional
    public AgencyBookingResponse markPickedUp(String phone, Long bookingId) {
        Booking booking = verifyOwnership(phone, bookingId);
        if (booking.getStatus() != BookingStatus.AGENT_APPROVED)
            throw new IllegalArgumentException(
                    "Booking must be AGENT_APPROVED before marking as picked up.");
        booking.setStatus(BookingStatus.PICKED_UP);
        return toResponse(bookingRepository.save(booking));
    }

    @Transactional
    public AgencyBookingResponse markDelivered(String phone, Long bookingId) {
        Booking booking = verifyOwnership(phone, bookingId);
        if (booking.getStatus() != BookingStatus.PICKED_UP)
            throw new IllegalArgumentException(
                    "Booking must be PICKED_UP before marking as delivered.");
        booking.setStatus(BookingStatus.DELIVERED);
        return toResponse(bookingRepository.save(booking));
    }

    @Transactional
    public AgencyBookingResponse markCompleted(String phone, Long bookingId) {
        Booking booking = verifyOwnership(phone, bookingId);
        if (booking.getStatus() != BookingStatus.DELIVERED)
            throw new IllegalArgumentException(
                    "Booking must be DELIVERED before marking as completed.");
        booking.setStatus(BookingStatus.COMPLETED);
        return toResponse(bookingRepository.save(booking));
    }

    private Booking verifyOwnership(String phone, Long bookingId) {
        Agency agency = getAgency(phone);
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
        if (!booking.getPkg().getAgency().getId().equals(agency.getId()))
            throw new IllegalArgumentException(
                    "This booking does not belong to your packages.");
        return booking;
    }

    private Agency getAgency(String phone) {
        User user = userRepository.findByPhone(phone)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return agencyRepository.findById(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Agency profile not found"));
    }

    private AgencyBookingResponse toResponse(Booking b) {
        return AgencyBookingResponse.builder()
                .bookingId(b.getId())
                .packageId(b.getPkg().getId())
                .marketDestination(b.getPkg().getMarketDestination())
                .travelDateTime(b.getPkg().getTravelDateTime())
                .pickupWindowStart(b.getPkg().getPickupWindowStart())
                .farmerName(b.getFarmer().getUser().getName())
                .farmerPhone(b.getFarmer().getUser().getPhone())
                .vegetableName(b.getVegetableName())
                .weightKg(b.getWeightKg())
                .priceAtBooking(b.getPriceAtBooking())
                .totalValue(b.getWeightKg() * b.getPriceAtBooking())
                .pickupAddress(b.getPickupAddress())
                .status(b.getStatus().name())
                .cancelReason(b.getCancelReason())
                .createdAt(b.getCreatedAt())
                .build();
    }
}
