package com.agriconnect.farmer.auth.service;

import com.agriconnect.farmer.auth.dto.*;
import com.agriconnect.shared.entity.*;
import com.agriconnect.shared.entity.Package;
import com.agriconnect.shared.enums.Role;
import com.agriconnect.shared.exception.*;
import com.agriconnect.shared.repository.*;
import com.agriconnect.shared.security.JwtUtil;
import com.agriconnect.shared.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class FarmerAuthService {

    private final UserRepository      userRepository;
    private final FarmerRepository    farmerRepository;
    private final OtpLogRepository    otpLogRepository;
    private final PasswordEncoder     passwordEncoder;
    private final JwtUtil             jwtUtil;
    private final AuthenticationManager authManager;
    private final EmailService        emailService;


    // ── REGISTER ─────────────────────────────────────────
    @Transactional
    public String register(FarmerRegisterRequest req) {
        User existingUser = userRepository.findByPhone(req.getPhone()).orElse(null);
        if (existingUser != null) {
            if (existingUser.getIsVerified()) {
                throw new IllegalArgumentException("Phone already registered.");
            } else {
                // Delete old OTP logs so rate-limit counter resets for re-registration
                otpLogRepository.deleteByPhone(req.getPhone());
                farmerRepository.findById(existingUser.getId()).ifPresent(farmerRepository::delete);
                userRepository.delete(existingUser);
                userRepository.flush();
            }
        }

        User user = userRepository.save(User.builder()
                .name(req.getName())
                .phone(req.getPhone())
                .email(req.getEmail())
                .passwordHash(passwordEncoder.encode(req.getPassword()))
                .role(Role.FARMER)
                .isVerified(false)
                .isActive(true)
                .build());

        farmerRepository.save(Farmer.builder()
                .id(user.getId())          // @MapsId: share PK with User
                .user(user)
                .district(req.getDistrict())
                .address(req.getAddress())
                .build());

        sendOtp(req.getPhone(), "REGISTRATION");

        return "Registered successfully. OTP sent to " + req.getPhone();
    }

    // ── LOGIN ─────────────────────────────────────────────
    public FarmerAuthResponse login(FarmerLoginRequest req) {
        try {
            authManager.authenticate(
                    new UsernamePasswordAuthenticationToken(req.getPhone(), req.getPassword()));
        } catch (BadCredentialsException e) {
            throw new IllegalArgumentException("Invalid phone or password.");
        }

        User user = userRepository.findByPhone(req.getPhone())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!user.getIsVerified())
            throw new IllegalArgumentException("Phone not verified. Please verify OTP first.");

        if (!user.getIsActive())
            throw new IllegalArgumentException("Account is deactivated. Contact support.");

        Farmer farmer = farmerRepository.findById(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Farmer profile not found"));

        return FarmerAuthResponse.builder()
                .token(jwtUtil.generateToken(user.getPhone(), "FARMER"))
                .name(user.getName())
                .userId(user.getId())
                .farmerId(farmer.getId())
                .role("FARMER")
                .message("Login successful")
                .build();
    }

    // ── VERIFY OTP ────────────────────────────────────────
    @Transactional
    public String verifyOtp(FarmerOtpVerifyRequest req) {
        Long recentCount = otpLogRepository.countRecentOtps(
                req.getPhone(), LocalDateTime.now().minusHours(1));
        if (recentCount == 0)
            throw new OtpException("No OTP request found for this phone.");

        OtpLog log = otpLogRepository
                .findActiveOtp(req.getPhone(), req.getPurpose(), LocalDateTime.now())
                .orElseThrow(() -> new OtpException("OTP expired or not found. Request a new one."));

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

        return "Phone verified. You can now login.";
    }

    // ── RESEND OTP ────────────────────────────────────────
    @Transactional
    public String resendOtp(String phone) {
        userRepository.findByPhone(phone)
                .orElseThrow(() -> new ResourceNotFoundException("Phone not registered."));

        Long recentCount = otpLogRepository.countRecentOtps(phone, LocalDateTime.now().minusHours(1));
        if (recentCount >= 3)
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
        System.out.println(">>> DEV OTP [" + phone + "]: " + otp);

        // Send email if user has one
        userRepository.findByPhone(phone).ifPresent(user -> {
            if (user.getEmail() != null && !user.getEmail().isBlank()) {
                emailService.sendOtp(user.getEmail(), otp, user.getName());
            }
        });
    }
}
