package com.agriconnect.admin.revenue.service;

import com.agriconnect.admin.revenue.dto.*;
import com.agriconnect.shared.entity.*;
import com.agriconnect.shared.entity.Package;
import com.agriconnect.shared.enums.*;
import com.agriconnect.shared.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminRevenueService {

    private final PaymentRepository paymentRepository;
    private final AgencyRepository  agencyRepository;
    private final BookingRepository bookingRepository;

    // ── FULL OVERVIEW ─────────────────────────────────────
    public RevenueOverviewResponse getOverview() {
        List<Payment> allPayments = paymentRepository.findAll();
        List<Agency>  allAgencies = agencyRepository.findAll();
        List<Booking> allBookings = bookingRepository.findAll();

        // Payment stats
        Double totalRevenue = allPayments.stream()
                .filter(p -> p.getStatus() == PaymentStatus.SUCCESS)
                .mapToDouble(Payment::getAmount).sum();

        Double pendingRevenue = allPayments.stream()
                .filter(p -> p.getStatus() == PaymentStatus.PENDING)
                .mapToDouble(Payment::getAmount).sum();

        long success   = count(allPayments, PaymentStatus.SUCCESS);
        long failed    = count(allPayments, PaymentStatus.FAILED);
        long pending   = count(allPayments, PaymentStatus.PENDING);
        long cancelled = count(allPayments, PaymentStatus.CANCELLED);

        // Agency stats
        long active         = countAgency(allAgencies, AgencyStatus.ACTIVE);
        long pendApproval   = countAgency(allAgencies, AgencyStatus.PENDING_APPROVAL);
        long pendPayment    = countAgency(allAgencies, AgencyStatus.PENDING_PAYMENT);
        long suspended      = countAgency(allAgencies, AgencyStatus.SUSPENDED);

        // Booking stats
        Double totalBookingValue = allBookings.stream()
                .mapToDouble(b -> b.getWeightKg() * b.getPriceAtBooking())
                .sum();
        Double completedBookingValue = allBookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.COMPLETED)
                .mapToDouble(b -> b.getWeightKg() * b.getPriceAtBooking())
                .sum();
        long completedBookings = allBookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.COMPLETED)
                .count();

        // Monthly revenue
        Map<String, List<Payment>> byMonth = allPayments.stream()
                .filter(p -> p.getStatus() == PaymentStatus.SUCCESS)
                .collect(Collectors.groupingBy(p -> {
                    var dt = p.getCreatedAt();
                    return dt.getYear() + "-" +
                            String.format("%02d", dt.getMonthValue());
                }));

        List<MonthlyRevenueEntry> monthly = byMonth.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(e -> MonthlyRevenueEntry.builder()
                        .yearMonth(e.getKey())
                        .revenue(e.getValue().stream()
                                .mapToDouble(Payment::getAmount).sum())
                        .paymentCount((long) e.getValue().size())
                        .build())
                .collect(Collectors.toList());

        // Per-agency revenue
        List<RevenueOverviewResponse.AgentRevenueEntry> agencyRevenue =
                allAgencies.stream().map(agency -> {
                    List<Payment> agencyPayments =
                            paymentRepository.findByAgencyId(agency.getId());
                    List<Booking> agencyBookings =
                            bookingRepository.findByPkgAgencyId(agency.getId());

                    Double paid = agencyPayments.stream()
                            .filter(p -> p.getStatus() == PaymentStatus.SUCCESS)
                            .mapToDouble(Payment::getAmount).sum();

                    Double bkValue = agencyBookings.stream()
                            .mapToDouble(b -> b.getWeightKg() * b.getPriceAtBooking())
                            .sum();

                    long completedBk = agencyBookings.stream()
                            .filter(b -> b.getStatus() == BookingStatus.COMPLETED)
                            .count();

                    return RevenueOverviewResponse.AgentRevenueEntry.builder()
                            .agentId(agency.getId())
                            .agentName(agency.getUser().getName())
                            .agentPhone(agency.getUser().getPhone())
                            .agentStatus(agency.getStatus().name())
                            .amountPaid(paid)
                            .totalBookings((long) agencyBookings.size())
                            .completedBookings(completedBk)
                            .totalBookingValue(bkValue)
                            .activatedAt(agency.getActivatedAt())
                            .build();
                }).collect(Collectors.toList());

        return RevenueOverviewResponse.builder()
                .totalRevenue(totalRevenue)
                .pendingRevenue(pendingRevenue)
                .totalPayments((long) allPayments.size())
                .successPayments(success)
                .failedPayments(failed)
                .pendingPayments(pending)
                .cancelledPayments(cancelled)
                .totalAgents((long) allAgencies.size())
                .activeAgents(active)
                .pendingApprovalAgents(pendApproval)
                .pendingPaymentAgents(pendPayment)
                .suspendedAgents(suspended)
                .totalBookings((long) allBookings.size())
                .completedBookings(completedBookings)
                .totalBookingValue(totalBookingValue)
                .completedBookingValue(completedBookingValue)
                .monthlyRevenue(monthly)
                .agentRevenue(agencyRevenue)
                .build();
    }

    // ── ALL PAYMENTS ──────────────────────────────────────
    public List<PaymentEntryResponse> getAllPayments() {
        return paymentRepository.findAll()
                .stream()
                .map(this::toPaymentResponse)
                .collect(Collectors.toList());
    }

    // ── PAYMENTS BY STATUS ────────────────────────────────
    public List<PaymentEntryResponse> getPaymentsByStatus(String status) {
        try {
            PaymentStatus ps = PaymentStatus.valueOf(status.toUpperCase());
            return paymentRepository.findAll().stream()
                    .filter(p -> p.getStatus() == ps)
                    .map(this::toPaymentResponse)
                    .collect(Collectors.toList());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException(
                    "Invalid payment status: " + status +
                            ". Valid: PENDING, SUCCESS, FAILED, CANCELLED");
        }
    }

    // ── PAYMENTS BY AGENCY ─────────────────────────────────
    public List<PaymentEntryResponse> getPaymentsByAgent(Long agencyId) {
        return paymentRepository
                .findByAgencyIdOrderByCreatedAtDesc(agencyId)
                .stream()
                .map(this::toPaymentResponse)
                .collect(Collectors.toList());
    }

    // ── HELPERS ───────────────────────────────────────────
    private long count(List<Payment> payments, PaymentStatus status) {
        return payments.stream()
                .filter(p -> p.getStatus() == status).count();
    }

    private long countAgency(List<Agency> agencies, AgencyStatus status) {
        return agencies.stream()
                .filter(a -> a.getStatus() == status).count();
    }

    private PaymentEntryResponse toPaymentResponse(Payment p) {
        return PaymentEntryResponse.builder()
                .paymentId(p.getId())
                .agentId(p.getAgency().getId())
                .agentName(p.getAgency().getUser().getName())
                .agentPhone(p.getAgency().getUser().getPhone())
                .amount(p.getAmount())
                .currency("LKR")
                .paymentReference(p.getPaymentReference())
                .paymentMethod(p.getPaymentMethod())
                .status(p.getStatus().name())
                .failureReason(p.getFailureReason())
                .createdAt(p.getCreatedAt())
                .build();
    }
}
