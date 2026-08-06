package com.agriconnect.agency.earnings.service;

import com.agriconnect.agency.earnings.dto.*;
import com.agriconnect.shared.entity.*;
import com.agriconnect.shared.entity.Package;
import com.agriconnect.shared.enums.*;
import com.agriconnect.shared.exception.ResourceNotFoundException;
import com.agriconnect.shared.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AgencyEarningsService {

    private final AgencyRepository  agencyRepository;
    private final BookingRepository bookingRepository;
    private final PackageRepository packageRepository;
    private final UserRepository    userRepository;

    public AgencyEarningsResponse getEarnings(String phone) {
        User   user   = getUser(phone);
        Agency agency = getAgency(user.getId());

        List<Booking> allBookings = bookingRepository.findByPkgAgencyId(agency.getId());

        List<Booking> completed = allBookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.COMPLETED)
                .collect(Collectors.toList());

        long pending = allBookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.CONFIRMED)
                .count();

        long cancelled = allBookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.AGENT_REJECTED ||
                        b.getStatus() == BookingStatus.CANCELLED)
                .count();

        Double totalExpected = allBookings.stream()
                .filter(b -> b.getStatus() != BookingStatus.AGENT_REJECTED &&
                        b.getStatus() != BookingStatus.CANCELLED)
                .mapToDouble(b -> b.getWeightKg() * b.getPriceAtBooking())
                .sum();

        Double confirmedEarnings = completed.stream()
                .mapToDouble(b -> b.getWeightKg() * b.getPriceAtBooking())
                .sum();

        Map<String, Double> byMarket = completed.stream()
                .collect(Collectors.groupingBy(
                        b -> b.getPkg().getMarketDestination(),
                        Collectors.summingDouble(b -> b.getWeightKg() * b.getPriceAtBooking())
                ));

        Map<String, Double> byMonth = new LinkedHashMap<>();
        completed.forEach(b -> {
            String key = b.getCreatedAt().getYear() + "-" +
                    String.format("%02d", b.getCreatedAt().getMonthValue());
            byMonth.merge(key, b.getWeightKg() * b.getPriceAtBooking(), Double::sum);
        });

        List<EarningEntryResponse> recent = completed.stream()
                .sorted(Comparator.comparing(Booking::getCreatedAt).reversed())
                .limit(10)
                .map(b -> EarningEntryResponse.builder()
                        .bookingId(b.getId())
                        .farmerName(b.getFarmer().getUser().getName())
                        .vegetableName(b.getVegetableName())
                        .weightKg(b.getWeightKg())
                        .pricePerKg(b.getPriceAtBooking())
                        .totalValue(b.getWeightKg() * b.getPriceAtBooking())
                        .marketDestination(b.getPkg().getMarketDestination())
                        .completedAt(b.getUpdatedAt())
                        .build())
                .collect(Collectors.toList());

        List<Package> allPackages = packageRepository.findByAgencyId(agency.getId());
        long activePackages = allPackages.stream()
                .filter(p -> p.getStatus() == PackageStatus.OPEN ||
                        p.getStatus() == PackageStatus.IN_TRANSIT)
                .count();

        return AgencyEarningsResponse.builder()
                .totalExpectedEarnings(totalExpected)
                .confirmedEarnings(confirmedEarnings)
                .totalBookings((long) allBookings.size())
                .completedBookings((long) completed.size())
                .pendingBookings(pending)
                .cancelledBookings(cancelled)
                .totalPackages((long) allPackages.size())
                .activePackages(activePackages)
                .earningsByMarket(byMarket)
                .earningsByMonth(byMonth)
                .recentCompletedBookings(recent)
                .build();
    }

    private User getUser(String phone) {
        return userRepository.findByPhone(phone)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private Agency getAgency(Long userId) {
        return agencyRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Agency profile not found"));
    }
}
