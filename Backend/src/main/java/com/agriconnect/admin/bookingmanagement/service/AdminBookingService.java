package com.agriconnect.admin.bookingmanagement.service;

import com.agriconnect.admin.bookingmanagement.dto.*;
import com.agriconnect.shared.entity.Booking;
import com.agriconnect.shared.enums.BookingStatus;
import com.agriconnect.shared.exception.ResourceNotFoundException;
import com.agriconnect.shared.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminBookingService {

    private final BookingRepository bookingRepository;

    // ── GET ALL BOOKINGS ──────────────────────────────────
    public AdminBookingListResponse getAllBookings() {
        List<Booking> all = bookingRepository.findAll();

        Map<String, Long> byMarket = all.stream()
                .collect(Collectors.groupingBy(
                        b -> b.getPkg().getMarketDestination(),
                        Collectors.counting()));

        Double totalValue = all.stream()
                .mapToDouble(b -> b.getWeightKg() * b.getPriceAtBooking())
                .sum();

        Double completedValue = all.stream()
                .filter(b -> b.getStatus() == BookingStatus.COMPLETED)
                .mapToDouble(b -> b.getWeightKg() * b.getPriceAtBooking())
                .sum();

        return AdminBookingListResponse.builder()
                .totalBookings((long) all.size())
                .confirmedBookings(count(all, BookingStatus.CONFIRMED))
                .completedBookings(count(all, BookingStatus.COMPLETED))
                .cancelledBookings(count(all, BookingStatus.CANCELLED))
                .pendingOtpBookings(count(all, BookingStatus.PENDING_OTP))
                .agentApprovedBookings(count(all, BookingStatus.AGENT_APPROVED))
                .pickedUpBookings(count(all, BookingStatus.PICKED_UP))
                .deliveredBookings(count(all, BookingStatus.DELIVERED))
                .totalValueAllBookings(totalValue)
                .totalValueCompleted(completedValue)
                .bookingsByMarket(byMarket)
                .bookings(all.stream()
                        .map(this::toResponse)
                        .collect(Collectors.toList()))
                .build();
    }

    // ── GET BOOKINGS BY STATUS ────────────────────────────
    public List<AdminBookingResponse> getByStatus(String status) {
        try {
            BookingStatus bs = BookingStatus.valueOf(status.toUpperCase());
            return bookingRepository.findByStatus(bs)
                    .stream()
                    .map(this::toResponse)
                    .collect(Collectors.toList());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException(
                    "Invalid status: " + status +
                            ". Valid: PENDING_OTP, CONFIRMED, AGENT_APPROVED, " +
                            "AGENT_REJECTED, PICKED_UP, DELIVERED, COMPLETED, CANCELLED");
        }
    }

    // ── GET BOOKINGS BY FARMER ────────────────────────────
    public List<AdminBookingResponse> getByFarmer(Long farmerId) {
        return bookingRepository
                .findByFarmerIdOrderByCreatedAtDesc(farmerId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ── GET BOOKINGS BY PACKAGE ───────────────────────────
    public List<AdminBookingResponse> getByPackage(Long packageId) {
        return bookingRepository.findByPkgId(packageId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ── GET BOOKINGS BY AGENCY ─────────────────────────────
    public List<AdminBookingResponse> getByAgent(Long agencyId) {
        return bookingRepository.findByPkgAgencyId(agencyId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ── GET SINGLE BOOKING ────────────────────────────────
    public AdminBookingResponse getById(Long bookingId) {
        return toResponse(bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Booking not found with ID: " + bookingId)));
    }

    // ── HELPERS ───────────────────────────────────────────
    private long count(List<Booking> all, BookingStatus status) {
        return all.stream()
                .filter(b -> b.getStatus() == status)
                .count();
    }

    private AdminBookingResponse toResponse(Booking b) {
        return AdminBookingResponse.builder()
                .bookingId(b.getId())
                .packageId(b.getPkg().getId())
                .farmerId(b.getFarmer().getId())
                .agentId(b.getPkg().getAgency().getId())
                .farmerName(b.getFarmer().getUser().getName())
                .farmerPhone(b.getFarmer().getUser().getPhone())
                .agentName(b.getPkg().getAgency().getUser().getName())
                .agentPhone(b.getPkg().getAgency().getUser().getPhone())
                .marketDestination(b.getPkg().getMarketDestination())
                .travelDateTime(b.getPkg().getTravelDateTime())
                .vegetableName(b.getVegetableName())
                .weightKg(b.getWeightKg())
                .priceAtBooking(b.getPriceAtBooking())
                .totalValue(b.getWeightKg() * b.getPriceAtBooking())
                .pickupAddress(b.getPickupAddress())
                .status(b.getStatus().name())
                .cancelReason(b.getCancelReason())
                .createdAt(b.getCreatedAt())
                .updatedAt(b.getUpdatedAt())
                .build();
    }
}
