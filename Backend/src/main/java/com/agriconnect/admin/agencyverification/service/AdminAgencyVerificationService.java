package com.agriconnect.admin.agencyverification.service;

import com.agriconnect.admin.agencyverification.dto.*;
import com.agriconnect.shared.entity.*;
import com.agriconnect.shared.enums.AgencyStatus;
import com.agriconnect.shared.exception.ResourceNotFoundException;
import com.agriconnect.shared.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminAgencyVerificationService {

    private final AgencyRepository         agencyRepository;
    private final AgencyDocumentRepository agencyDocumentRepository;
    private final UserRepository           userRepository;

    public List<AgencyVerificationResponse> getAllAgencies() {
        return agencyRepository.findAll()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<AgencyVerificationResponse> getAgenciesByStatus(String status) {
        try {
            AgencyStatus agencyStatus = AgencyStatus.valueOf(status.toUpperCase());
            return agencyRepository.findByStatus(agencyStatus)
                    .stream()
                    .map(this::toResponse)
                    .collect(Collectors.toList());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException(
                    "Invalid status: " + status +
                            ". Valid: PENDING_APPROVAL, APPROVED, REJECTED, " +
                            "PENDING_PAYMENT, ACTIVE, SUSPENDED");
        }
    }

    public List<AgencyVerificationResponse> getPendingAgencies() {
        return agencyRepository.findByStatus(AgencyStatus.PENDING_APPROVAL)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public AgencyVerificationResponse getAgencyById(Long agencyId) {
        return toResponse(findAgency(agencyId));
    }

    @Transactional
    public AgencyVerificationResponse approve(Long agencyId) {
        Agency agency = findAgency(agencyId);

        if (agency.getStatus() != AgencyStatus.PENDING_APPROVAL)
            throw new IllegalArgumentException(
                    "Agency is not in PENDING_APPROVAL state. Current: " + agency.getStatus());

        agency.setStatus(AgencyStatus.PENDING_PAYMENT);
        agency.setApprovedAt(LocalDateTime.now());
        agencyRepository.save(agency);

        System.out.println(">>> SMS to " + agency.getUser().getPhone() +
                ": Your AgriConnect account is approved! " +
                "Login and pay the activation fee (LKR 2500) to start.");

        return toResponse(agency);
    }

    @Transactional
    public AgencyVerificationResponse reject(Long agencyId, String reason) {
        Agency agency = findAgency(agencyId);

        if (agency.getStatus() == AgencyStatus.ACTIVE ||
                agency.getStatus() == AgencyStatus.SUSPENDED)
            throw new IllegalArgumentException(
                    "Cannot reject an agency with status: " + agency.getStatus());

        agency.setStatus(AgencyStatus.REJECTED);
        agencyRepository.save(agency);

        System.out.println(">>> SMS to " + agency.getUser().getPhone() +
                ": Your AgriConnect application was rejected. Reason: " + reason +
                ". Contact support for help.");

        return toResponse(agency);
    }

    @Transactional
    public AgencyVerificationResponse suspend(Long agencyId) {
        Agency agency = findAgency(agencyId);

        if (agency.getStatus() != AgencyStatus.ACTIVE)
            throw new IllegalArgumentException(
                    "Only ACTIVE agencies can be suspended. Current: " + agency.getStatus());

        agency.setStatus(AgencyStatus.SUSPENDED);
        agencyRepository.save(agency);

        System.out.println(">>> SMS to " + agency.getUser().getPhone() +
                ": Your AgriConnect account has been suspended. Contact support.");

        return toResponse(agency);
    }

    @Transactional
    public AgencyVerificationResponse reactivate(Long agencyId) {
        Agency agency = findAgency(agencyId);

        if (agency.getStatus() != AgencyStatus.SUSPENDED)
            throw new IllegalArgumentException(
                    "Only SUSPENDED agencies can be reactivated. Current: " + agency.getStatus());

        agency.setStatus(AgencyStatus.ACTIVE);
        agencyRepository.save(agency);

        System.out.println(">>> SMS to " + agency.getUser().getPhone() +
                ": Your AgriConnect account has been reactivated. You can now create packages.");

        return toResponse(agency);
    }

    @Transactional
    public AgencyVerificationResponse activateAfterPayment(Long agencyId) {
        Agency agency = findAgency(agencyId);

        if (agency.getStatus() != AgencyStatus.PENDING_PAYMENT)
            throw new IllegalArgumentException(
                    "Agency is not in PENDING_PAYMENT state. Current: " + agency.getStatus());

        agency.setStatus(AgencyStatus.ACTIVE);
        agency.setActivatedAt(LocalDateTime.now());
        agencyRepository.save(agency);

        System.out.println(">>> SMS to " + agency.getUser().getPhone() +
                ": Your account is now ACTIVE! You can create packages.");

        return toResponse(agency);
    }

    private Agency findAgency(Long agencyId) {
        return agencyRepository.findById(agencyId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Agency not found with ID: " + agencyId));
    }

    private AgencyVerificationResponse toResponse(Agency agency) {
        AgencyDocument doc = agencyDocumentRepository
                .findByAgencyId(agency.getId()).orElse(null);

        return AgencyVerificationResponse.builder()
                .agencyId(agency.getId())
                .userId(agency.getUser().getId())
                .name(agency.getUser().getName())
                .phone(agency.getUser().getPhone())
                .nicNumber(agency.getNicNumber())
                .address(agency.getAddress())
                .agencyStatus(agency.getStatus().name())
                .nicFrontUrl(doc != null ? doc.getNicFrontUrl() : null)
                .nicBackUrl(doc != null ? doc.getNicBackUrl() : null)
                .averageRating(agency.getAverageRating())
                .totalRatings(agency.getTotalRatings())
                .bankName(agency.getBankName())
                .maskedAccountNumber(mask(agency.getAccountNumber()))
                .accountHolderName(agency.getAccountHolderName())
                .createdAt(agency.getCreatedAt())
                .approvedAt(agency.getApprovedAt())
                .activatedAt(agency.getActivatedAt())
                .build();
    }

    private String mask(String acc) {
        if (acc == null || acc.length() < 4) return "****";
        return "****" + acc.substring(acc.length() - 4);
    }
}
