package com.agriconnect.agency.auth.service;

import com.agriconnect.agency.auth.dto.*;
import com.agriconnect.shared.entity.*;
import com.agriconnect.shared.enums.*;
import com.agriconnect.shared.exception.*;
import com.agriconnect.shared.repository.*;
import com.agriconnect.shared.security.JwtUtil;
import com.agriconnect.shared.service.EmailService;
import com.agriconnect.shared.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class AgencyAuthService {

    private final UserRepository           userRepository;
    private final AgencyRepository         agencyRepository;
    private final AgencyDocumentRepository agencyDocumentRepository;
    private final OtpLogRepository         otpLogRepository;
    private final PasswordEncoder          passwordEncoder;
    private final JwtUtil                  jwtUtil;
    private final AuthenticationManager   authManager;
    private final EmailService            emailService;
    private final FileStorageService      fileStorageService;

    // ── REGISTER WITH NIC (multipart) ─────────────────────
    @Transactional
    public String registerWithNic(
            String name, String phone, String password, String email,
            String nicNumber, String address,
            String bankName, String accountNumber, String accountHolderName,
            MultipartFile nicFront, MultipartFile nicBack) throws IOException {

        if (nicNumber == null || nicNumber.isBlank())
            throw new IllegalArgumentException("NIC number is required.");
        if (address == null || address.isBlank())
            throw new IllegalArgumentException("Address is required.");

        User existingUser = userRepository.findByPhone(phone).orElse(null);
        if (existingUser != null) {
            if (existingUser.getIsVerified()) {
                throw new IllegalArgumentException("Phone already registered.");
            } else {
                otpLogRepository.deleteByPhone(phone);
                agencyRepository.findById(existingUser.getId()).ifPresent(a -> {
                    agencyDocumentRepository.findByAgencyId(a.getId())
                            .ifPresent(agencyDocumentRepository::delete);
                    agencyRepository.delete(a);
                });
                userRepository.delete(existingUser);
                userRepository.flush();
            }
        }

        if (agencyRepository.existsByNicNumber(nicNumber))
            throw new IllegalArgumentException("NIC number already registered.");

        User user = userRepository.save(User.builder()
                .name(name).phone(phone).email(email)
                .passwordHash(passwordEncoder.encode(password))
                .role(Role.AGENCY).isVerified(false).isActive(true)
                .build());

        Agency agency = agencyRepository.save(Agency.builder()
                .id(user.getId())
                .user(user).nicNumber(nicNumber).address(address)
                .bankName(bankName).accountNumber(accountNumber)
                .accountHolderName(accountHolderName)
                .status(AgencyStatus.PENDING_APPROVAL)
                .averageRating(0.0).totalRatings(0)
                .build());

        // Save NIC photos if provided
        if (nicFront != null && !nicFront.isEmpty() && nicBack != null && !nicBack.isEmpty()) {
            String frontPath = fileStorageService.store(nicFront, "nic/" + agency.getId() + "/front");
            String backPath  = fileStorageService.store(nicBack,  "nic/" + agency.getId() + "/back");
            agencyDocumentRepository.save(AgencyDocument.builder()
                    .agency(agency).nicFrontUrl(frontPath).nicBackUrl(backPath)
                    .build());
        }

        sendOtp(phone, "REGISTRATION");
        return "Agency registered. OTP sent to " + phone + ". After phone verification, await admin approval.";
    }

    // ── LOGIN ─────────────────────────────────────────────
    public AgencyAuthResponse login(AgencyLoginRequest req) {
        try {
            authManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            req.getPhone(), req.getPassword()));
        } catch (BadCredentialsException e) {
            throw new IllegalArgumentException("Invalid phone or password.");
        }

        User user = userRepository.findByPhone(req.getPhone())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!user.getIsVerified())
            throw new IllegalArgumentException(
                    "Phone not verified. Please verify OTP first.");

        Agency agency = agencyRepository.findById(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Agency profile not found"));

        String token = jwtUtil.generateToken(user.getPhone(), "AGENCY");

        AgencyAuthResponse.AgencyAuthResponseBuilder responseBuilder = AgencyAuthResponse.builder()
                .token(token)
                .name(user.getName())
                .userId(user.getId())
                .agencyId(agency.getId())
                .role("AGENCY")
                .agencyStatus(agency.getStatus().name());

        switch (agency.getStatus()) {
            case PENDING_APPROVAL -> {
                return responseBuilder
                        .message("Your account is under admin review. Please wait.")
                        .build();
            }
            case REJECTED -> {
                return responseBuilder
                        .message("Your account was rejected. Contact support.")
                        .build();
            }
            case SUSPENDED -> {
                return responseBuilder
                        .message("Your account is suspended. Contact support.")
                        .build();
            }
            case PENDING_PAYMENT -> {
                return responseBuilder
                        .message("Account approved! Please pay the activation fee (LKR 2500) to continue.")
                        .build();
            }
            default -> {
                return responseBuilder
                        .message("Login successful")
                        .build();
            }
        }
    }

    // ── VERIFY OTP ────────────────────────────────────────
    @Transactional
    public String verifyOtp(AgencyOtpVerifyRequest req) {
        OtpLog log = otpLogRepository
                .findActiveOtp(req.getPhone(), req.getPurpose(), LocalDateTime.now())
                .orElseThrow(() -> new OtpException(
                        "OTP expired or not found. Request a new one."));

        if (log.getAttempts() >= 3)
            throw new OtpException("Max attempts exceeded. Request a new OTP.");

        log.setAttempts(log.getAttempts() + 1);

        if (!log.getOtp().equals(req.getOtp())) {
            otpLogRepository.save(log);
            int left = 3 - log.getAttempts();
            throw new OtpException("Wrong OTP. " + left + " attempt(s) remaining.");
        }

        log.setIsUsed(true);
        otpLogRepository.save(log);

        User user = userRepository.findByPhone(req.getPhone())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setIsVerified(true);
        userRepository.save(user);

        return "Phone verified. Await admin approval to activate your account.";
    }

    // ── RESEND OTP ────────────────────────────────────────
    @Transactional
    public String resendOtp(String phone) {
        userRepository.findByPhone(phone)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Phone not registered."));

        Long recent = otpLogRepository.countRecentOtps(
                phone, LocalDateTime.now().minusHours(1));
        if (recent >= 3)
            throw new OtpException("Too many OTP requests. Try again in 1 hour.");

        sendOtp(phone, "REGISTRATION");
        return "OTP resent to " + phone;
    }

    // ── HELPER ────────────────────────────────────────────
    private void sendOtp(String phone, String purpose) {
        String otp = String.format("%06d", new Random().nextInt(999999));
        otpLogRepository.save(OtpLog.builder()
                .phone(phone).otp(otp).purpose(purpose)
                .expiresAt(LocalDateTime.now().plusMinutes(5))
                .attempts(0).isUsed(false)
                .build());
        System.out.println(">>> AGENCY OTP [" + phone + "]: " + otp);

        userRepository.findByPhone(phone).ifPresent(user -> {
            if (user.getEmail() != null && !user.getEmail().isBlank()) {
                emailService.sendOtp(user.getEmail(), otp, user.getName());
            }
        });
    }
}
