package com.agriconnect.farmer.booking.service;

import com.agriconnect.farmer.booking.dto.*;
import com.agriconnect.shared.entity.*;
import com.agriconnect.shared.entity.Package;
import com.agriconnect.shared.enums.*;
import com.agriconnect.shared.exception.*;
import com.agriconnect.shared.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FarmerBookingService {

    private final BookingRepository          bookingRepository;
    private final PackageRepository          packageRepository;
    private final PackageVegetableRepository pvRepository;
    private final FarmerRepository           farmerRepository;
    private final BankDetailRepository       bankDetailRepository;
    private final RatingRepository           ratingRepository;
    private final OtpLogRepository           otpLogRepository;
    private final UserRepository             userRepository;

    // ── STEP 1: Validate + save bank + send OTP ──────────
    @Transactional
    public String initiateBooking(String phone, BookingInitiateRequest req) {
        User   user   = getUser(phone);
        Farmer farmer = getFarmer(user.getId());

        com.agriconnect.shared.entity.Package pkg = packageRepository.findById(req.getPackageId())
                .orElseThrow(() -> new ResourceNotFoundException("Package not found"));

        if (pkg.getStatus() != PackageStatus.OPEN)
            throw new CapacityExceededException("Package is not accepting bookings.");

        if (pkg.getRemainingCapacityKg() < req.getWeightKg())
            throw new CapacityExceededException(
                    "Requested " + req.getWeightKg() + "kg exceeds available " +
                            pkg.getRemainingCapacityKg() + "kg.");

        PackageVegetable pv = getVegetable(pkg, req.getVegetableName());

        if (pv.getRemainingKg() < req.getWeightKg())
            throw new CapacityExceededException(
                    "Only " + pv.getRemainingKg() + "kg of " +
                            req.getVegetableName() + " available.");

        // Save / update bank details
        BankDetail bank = bankDetailRepository.findByFarmerId(farmer.getId())
                .orElse(BankDetail.builder().farmer(farmer).build());
        bank.setBankName(req.getBankName());
        bank.setAccountNumber(req.getAccountNumber());
        bank.setAccountHolderName(req.getAccountHolderName());
        bankDetailRepository.save(bank);

        // Send OTP
        sendBookingOtp(phone);

        return "OTP sent to " + phone + ". Enter OTP to confirm booking.";
    }

    // ── STEP 2: Verify OTP + confirm booking ─────────────
    @Transactional
    public FarmerBookingResponse confirmBooking(String phone, BookingConfirmRequest req) {

        // Verify OTP
        OtpLog log = otpLogRepository
                .findActiveOtp(phone, "BOOKING", LocalDateTime.now())
                .orElseThrow(() -> new OtpException("OTP expired or not found."));

        if (log.getAttempts() >= 3)
            throw new OtpException("Max OTP attempts exceeded.");

        log.setAttempts(log.getAttempts() + 1);
        if (!log.getOtp().equals(req.getOtp())) {
            otpLogRepository.save(log);
            throw new OtpException("Wrong OTP. " + (3 - log.getAttempts()) + " attempt(s) left.");
        }
        log.setIsUsed(true);
        otpLogRepository.save(log);

        // Get farmer
        User   user   = getUser(phone);
        Farmer farmer = getFarmer(user.getId());

        // Get package and re-validate capacity (race condition protection)
        com.agriconnect.shared.entity.Package pkg = packageRepository.findById(req.getPackageId())
                .orElseThrow(() -> new ResourceNotFoundException("Package not found"));

        if (pkg.getStatus() != PackageStatus.OPEN)
            throw new CapacityExceededException("Package is no longer available.");

        PackageVegetable pv = getVegetable(pkg, req.getVegetableName());

        if (pv.getRemainingKg() < req.getWeightKg())
            throw new CapacityExceededException(
                    "Sorry, capacity changed. Only " + pv.getRemainingKg() + "kg available.");

        // Reduce capacity atomically
        pv.setRemainingKg(pv.getRemainingKg() - req.getWeightKg());
        pvRepository.save(pv);

        pkg.setRemainingCapacityKg(pkg.getRemainingCapacityKg() - req.getWeightKg());
        if (pkg.getRemainingCapacityKg() <= 0)
            pkg.setStatus(PackageStatus.FULL);
        packageRepository.save(pkg);

        // Create booking
        Booking booking = bookingRepository.save(Booking.builder()
                .pkg(pkg)
                .farmer(farmer)
                .vegetableName(req.getVegetableName())
                .weightKg(req.getWeightKg())
                .priceAtBooking(pv.getPricePerKg())
                .pickupAddress(req.getPickupAddress())
                .status(BookingStatus.CONFIRMED)
                .build());

        // Send SMS confirmation (dev: print)
        System.out.println(">>> SMS to " + phone + ": Booking confirmed! " +
                "Agent: " + pkg.getAgency().getUser().getName() +
                " | Market: " + pkg.getMarketDestination() +
                " | Pickup: " + pkg.getPickupWindowStart());

        return toResponse(booking, false);
    }

    // ── GET MY BOOKINGS ───────────────────────────────────
    public List<FarmerBookingResponse> getMyBookings(String phone) {
        User   user   = getUser(phone);
        Farmer farmer = getFarmer(user.getId());

        return bookingRepository
                .findByFarmerIdOrderByCreatedAtDesc(farmer.getId())
                .stream()
                .map(b -> {
                    boolean rated = ratingRepository
                            .existsByBookingIdAndFarmerId(b.getId(), farmer.getId());
                    return toResponse(b, rated);
                })
                .collect(Collectors.toList());
    }

    // ── CANCEL BOOKING ────────────────────────────────────
    @Transactional
    public FarmerBookingResponse cancelBooking(String phone, Long bookingId) {
        User   user   = getUser(phone);
        Farmer farmer = getFarmer(user.getId());

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        if (!booking.getFarmer().getId().equals(farmer.getId()))
            throw new IllegalArgumentException("This booking does not belong to you.");

        if (booking.getStatus() == BookingStatus.PICKED_UP ||
                booking.getStatus() == BookingStatus.DELIVERED  ||
                booking.getStatus() == BookingStatus.COMPLETED)
            throw new IllegalArgumentException("Cannot cancel a booking in status: " +
                    booking.getStatus());

        // Restore capacity
        com.agriconnect.shared.entity.Package pkg = booking.getPkg();
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

        booking.setStatus(BookingStatus.CANCELLED);
        booking.setCancelReason("Cancelled by farmer");
        bookingRepository.save(booking);

        return toResponse(booking, false);
    }

    // ── HELPERS ───────────────────────────────────────────
    private User getUser(String phone) {
        return userRepository.findByPhone(phone)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private Farmer getFarmer(Long userId) {
        return farmerRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Farmer not found"));
    }

    private PackageVegetable getVegetable(com.agriconnect.shared.entity.Package pkg, String name) {
        return pkg.getVegetables().stream()
                .filter(v -> v.getVegetableName().equalsIgnoreCase(name))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException(name + " not available in package"));
    }

    private void sendBookingOtp(String phone) {
        Long recent = otpLogRepository.countRecentOtps(phone, LocalDateTime.now().minusHours(1));
        if (recent >= 5) throw new OtpException("Too many OTP requests. Try again later.");

        String otp = String.format("%06d", new Random().nextInt(999999));
        otpLogRepository.save(OtpLog.builder()
                .phone(phone).otp(otp).purpose("BOOKING")
                .expiresAt(LocalDateTime.now().plusMinutes(5))
                .attempts(0).isUsed(false).build());
        System.out.println(">>> BOOKING OTP [" + phone + "]: " + otp);
    }

    private FarmerBookingResponse toResponse(Booking b, boolean isRated) {
        return FarmerBookingResponse.builder()
                .bookingId(b.getId())
                .packageId(b.getPkg().getId())
                .marketDestination(b.getPkg().getMarketDestination())
                .travelDateTime(b.getPkg().getTravelDateTime())
                .pickupWindowStart(b.getPkg().getPickupWindowStart())
                .vegetableName(b.getVegetableName())
                .weightKg(b.getWeightKg())
                .priceAtBooking(b.getPriceAtBooking())
                .totalValue(b.getWeightKg() * b.getPriceAtBooking())
                .pickupAddress(b.getPickupAddress())
                .status(b.getStatus().name())
                .agentName(b.getPkg().getAgency().getUser().getName())
                .agentPhone(b.getPkg().getAgency().getUser().getPhone())
                .isRated(isRated)
                .createdAt(b.getCreatedAt())
                .build();
    }
}
