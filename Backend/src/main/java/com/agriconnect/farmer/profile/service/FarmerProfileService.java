package com.agriconnect.farmer.profile.service;

import com.agriconnect.farmer.profile.dto.*;
import com.agriconnect.shared.entity.*;
import com.agriconnect.shared.entity.Package;
import com.agriconnect.shared.exception.ResourceNotFoundException;
import com.agriconnect.shared.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;

@Service
@RequiredArgsConstructor
public class FarmerProfileService {

    private final UserRepository       userRepository;
    private final FarmerRepository     farmerRepository;
    private final BankDetailRepository bankDetailRepository;
    private final PasswordEncoder passwordEncoder;

    private final com.agriconnect.shared.service.FileStorageService fileStorageService;

    public FarmerProfileResponse getProfile(String phone) {
        User user     = getUser(phone);
        Farmer farmer = getFarmer(user.getId());
        BankDetail bank = bankDetailRepository.findByFarmerId(farmer.getId()).orElse(null);

        return FarmerProfileResponse.builder()
                .farmerId(farmer.getId())
                .name(user.getName())
                .phone(user.getPhone())
                .district(farmer.getDistrict())
                .address(farmer.getAddress())
                .isVerified(user.getIsVerified())
                .profilePicture(user.getProfilePicture())
                .bankName(bank != null ? bank.getBankName() : null)
                .maskedAccountNumber(bank != null ? maskAccount(bank.getAccountNumber()) : null)
                .accountHolderName(bank != null ? bank.getAccountHolderName() : null)
                .build();
    }

    @Transactional
    public FarmerProfileResponse updateProfile(String phone, UpdateProfileRequest req) {
        User user = getUser(phone);
        user.setName(req.getName());
        userRepository.save(user);

        Farmer farmer = getFarmer(user.getId());
        if (req.getDistrict() != null) farmer.setDistrict(req.getDistrict());
        if (req.getAddress()  != null) farmer.setAddress(req.getAddress());
        farmerRepository.save(farmer);

        return getProfile(phone);
    }

    @Transactional
    public FarmerProfileResponse uploadProfilePicture(String phone, org.springframework.web.multipart.MultipartFile file) throws java.io.IOException {
        User user = getUser(phone);
        String path = fileStorageService.store(file, "profile-pictures");
        user.setProfilePicture(path);
        userRepository.save(user);
        return getProfile(phone);
    }

    @Transactional
    public void changePassword(String phone, ChangePasswordRequest req) {
        User user = getUser(phone);
        if (!passwordEncoder.matches(req.getCurrentPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Incorrect current password.");
        }
        user.setPasswordHash(passwordEncoder.encode(req.getNewPassword()));
        userRepository.save(user);
    }

    private User getUser(String phone) {
        return userRepository.findByPhone(phone)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private Farmer getFarmer(Long userId) {
        return farmerRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Farmer profile not found"));
    }

    private String maskAccount(String acc) {
        if (acc == null || acc.length() < 4) return "****";
        return "****" + acc.substring(acc.length() - 4);
    }
}
