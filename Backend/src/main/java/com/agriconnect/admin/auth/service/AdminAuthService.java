package com.agriconnect.admin.auth.service;

import com.agriconnect.admin.auth.dto.*;
import com.agriconnect.shared.entity.User;
import com.agriconnect.shared.enums.Role;
import com.agriconnect.shared.exception.ResourceNotFoundException;
import com.agriconnect.shared.repository.UserRepository;
import com.agriconnect.shared.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminAuthService {

    private final UserRepository     userRepository;
    private final PasswordEncoder    passwordEncoder;
    private final JwtUtil            jwtUtil;
    private final AuthenticationManager authManager;

    // ── LOGIN ─────────────────────────────────────────────
    public AdminAuthResponse login(AdminLoginRequest req) {
        try {
            authManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            req.getPhone(), req.getPassword()));
        } catch (BadCredentialsException e) {
            throw new IllegalArgumentException("Invalid phone or password.");
        }

        User user = userRepository.findByPhone(req.getPhone())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.getRole() != Role.ADMIN)
            throw new IllegalArgumentException(
                    "Access denied. Not an admin account.");

        if (!user.getIsActive())
            throw new IllegalArgumentException("Admin account is deactivated.");

        return AdminAuthResponse.builder()
                .token(jwtUtil.generateToken(user.getPhone(), "ADMIN"))
                .name(user.getName())
                .userId(user.getId())
                .role("ADMIN")
                .message("Login successful")
                .build();
    }

    // ── CREATE ADMIN ──────────────────────────────────────
    @Transactional
    public String createAdmin(String name, String phone, String password, String email) {
        User existingUser = userRepository.findByPhone(phone).orElse(null);
        if (existingUser != null) {
            if (existingUser.getIsVerified()) {
                throw new IllegalArgumentException("Phone already registered.");
            } else {
                // Allow re-registration if previous attempt was not verified
                userRepository.delete(existingUser);
                userRepository.flush();
            }
        }

        userRepository.save(User.builder()
                .name(name)
                .phone(phone)
                .email(email)
                .passwordHash(passwordEncoder.encode(password))
                .role(Role.ADMIN)
                .isVerified(true)
                .isActive(true)
                .build());

        return "Admin account created for " + phone;
    }
}
