package com.agriconnect.farmer.bankdetail.service;

import com.agriconnect.farmer.bankdetail.dto.*;
import com.agriconnect.shared.entity.*;
import com.agriconnect.shared.entity.Package;
import com.agriconnect.shared.exception.ResourceNotFoundException;
import com.agriconnect.shared.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class FarmerBankDetailService {

    private final UserRepository       userRepository;
    private final FarmerRepository     farmerRepository;
    private final BankDetailRepository bankDetailRepository;

    public BankDetailResponse get(String phone) {
        Farmer farmer = getFarmer(phone);
        BankDetail bank = bankDetailRepository.findByFarmerId(farmer.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Bank details not added yet."));
        return toResponse(bank);
    }

    @Transactional
    public BankDetailResponse saveOrUpdate(String phone, BankDetailRequest req) {
        Farmer farmer = getFarmer(phone);

        BankDetail bank = bankDetailRepository.findByFarmerId(farmer.getId())
                .orElse(BankDetail.builder().farmer(farmer).build());

        bank.setBankName(req.getBankName());
        bank.setAccountNumber(req.getAccountNumber());
        bank.setAccountHolderName(req.getAccountHolderName());

        return toResponse(bankDetailRepository.save(bank));
    }

    @Transactional
    public String delete(String phone) {
        Farmer farmer = getFarmer(phone);
        BankDetail bank = bankDetailRepository.findByFarmerId(farmer.getId())
                .orElseThrow(() -> new ResourceNotFoundException("No bank details found."));
        bankDetailRepository.delete(bank);
        return "Bank details removed successfully.";
    }

    private Farmer getFarmer(String phone) {
        User user = userRepository.findByPhone(phone)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return farmerRepository.findById(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Farmer not found"));
    }

    private BankDetailResponse toResponse(BankDetail bank) {
        return BankDetailResponse.builder()
                .bankDetailId(bank.getId())
                .bankName(bank.getBankName())
                .maskedAccountNumber(mask(bank.getAccountNumber()))
                .accountHolderName(bank.getAccountHolderName())
                .updatedAt(bank.getUpdatedAt())
                .build();
    }

    private String mask(String acc) {
        if (acc == null || acc.length() < 4) return "****";
        return "****" + acc.substring(acc.length() - 4);
    }
}
