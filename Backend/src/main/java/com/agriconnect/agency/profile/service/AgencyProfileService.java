package com.agriconnect.agency.profile.service;

import com.agriconnect.agency.profile.dto.*;
import com.agriconnect.shared.entity.*;
import com.agriconnect.shared.exception.ResourceNotFoundException;
import com.agriconnect.shared.repository.*;
import com.agriconnect.shared.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
@RequiredArgsConstructor
public class AgencyProfileService {

    private final UserRepository           userRepository;
    private final AgencyRepository         agencyRepository;
    private final AgencyDocumentRepository agencyDocumentRepository;
    private final FileStorageService       fileStorageService;

    public AgencyProfileResponse getProfile(String phone) {
        User   user   = getUser(phone);
        Agency agency = getAgency(user.getId());
        AgencyDocument doc = agencyDocumentRepository
                .findByAgencyId(agency.getId()).orElse(null);

        return AgencyProfileResponse.builder()
                .agencyId(agency.getId())
                .name(user.getName())
                .phone(user.getPhone())
                .nicNumber(agency.getNicNumber())
                .address(agency.getAddress())
                .agencyStatus(agency.getStatus().name())
                .averageRating(agency.getAverageRating())
                .totalRatings(agency.getTotalRatings())
                .bankName(agency.getBankName())
                .maskedAccountNumber(mask(agency.getAccountNumber()))
                .accountHolderName(agency.getAccountHolderName())
                .nicFrontUrl(doc != null ? doc.getNicFrontUrl() : null)
                .nicBackUrl(doc != null ? doc.getNicBackUrl() : null)
                .createdAt(agency.getCreatedAt())
                .activatedAt(agency.getActivatedAt())
                .build();
    }

    @Transactional
    public AgencyProfileResponse updateProfile(String phone, UpdateAgencyProfileRequest req) {
        User   user   = getUser(phone);
        Agency agency = getAgency(user.getId());

        user.setName(req.getName());
        userRepository.save(user);

        if (req.getAddress() != null)          agency.setAddress(req.getAddress());
        if (req.getBankName() != null)         agency.setBankName(req.getBankName());
        if (req.getAccountNumber() != null)    agency.setAccountNumber(req.getAccountNumber());
        if (req.getAccountHolderName() != null) agency.setAccountHolderName(req.getAccountHolderName());

        agencyRepository.save(agency);
        return getProfile(phone);
    }

    @Transactional
    public NicUploadResponse uploadNic(String phone, MultipartFile nicFront,
                                       MultipartFile nicBack) throws IOException {
        User   user   = getUser(phone);
        Agency agency = getAgency(user.getId());

        String frontPath = fileStorageService.store(nicFront, "nic/" + agency.getId() + "/front");
        String backPath  = fileStorageService.store(nicBack,  "nic/" + agency.getId() + "/back");

        AgencyDocument doc = agencyDocumentRepository
                .findByAgencyId(agency.getId())
                .orElse(AgencyDocument.builder().agency(agency).build());

        doc.setNicFrontUrl(frontPath);
        doc.setNicBackUrl(backPath);
        agencyDocumentRepository.save(doc);

        return NicUploadResponse.builder()
                .message("NIC documents uploaded successfully. Awaiting admin review.")
                .nicFrontUrl(frontPath)
                .nicBackUrl(backPath)
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

    private String mask(String acc) {
        if (acc == null || acc.length() < 4) return "****";
        return "****" + acc.substring(acc.length() - 4);
    }
}
