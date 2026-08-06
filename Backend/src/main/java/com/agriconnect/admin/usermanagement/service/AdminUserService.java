package com.agriconnect.admin.usermanagement.service;

import com.agriconnect.admin.usermanagement.dto.*;
import com.agriconnect.shared.entity.*;
import com.agriconnect.shared.entity.Package;
import com.agriconnect.shared.enums.Role;
import com.agriconnect.shared.exception.ResourceNotFoundException;
import com.agriconnect.shared.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminUserService {

    private final UserRepository    userRepository;
    private final FarmerRepository  farmerRepository;
    private final AgencyRepository  agencyRepository;

    // ── GET ALL USERS ─────────────────────────────────────
    public AdminUserListResponse getAllUsers() {
        List<User> all = userRepository.findAll();

        long farmers  = all.stream().filter(u -> u.getRole() == Role.FARMER).count();
        long agencies = all.stream().filter(u -> u.getRole() == Role.AGENCY).count();
        long admins   = all.stream().filter(u -> u.getRole() == Role.ADMIN).count();
        long active   = all.stream().filter(User::getIsActive).count();
        long inactive = all.stream().filter(u -> !u.getIsActive()).count();

        List<AdminUserResponse> users = all.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());

        return AdminUserListResponse.builder()
                .totalUsers((long) all.size())
                .totalFarmers(farmers)
                .totalAgents(agencies)
                .totalAdmins(admins)
                .activeUsers(active)
                .inactiveUsers(inactive)
                .users(users)
                .build();
    }

    // ── GET USERS BY ROLE ─────────────────────────────────
    public List<AdminUserResponse> getUsersByRole(String role) {
        try {
            Role r = Role.valueOf(role.toUpperCase());
            return userRepository.findByRole(r)
                    .stream()
                    .map(this::toResponse)
                    .collect(Collectors.toList());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException(
                    "Invalid role: " + role + ". Valid: FARMER, AGENCY, ADMIN");
        }
    }

    // ── GET USER BY ID ────────────────────────────────────
    public AdminUserResponse getUserById(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found with ID: " + userId));
        return toResponse(user);
    }

    // ── GET USER BY PHONE ─────────────────────────────────
    public AdminUserResponse getUserByPhone(String phone) {
        User user = userRepository.findByPhone(phone)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found with phone: " + phone));
        return toResponse(user);
    }

    // ── DEACTIVATE USER ───────────────────────────────────
    @Transactional
    public AdminUserResponse deactivateUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found with ID: " + userId));

        if (user.getRole() == Role.ADMIN)
            throw new IllegalArgumentException(
                    "Cannot deactivate an admin account.");

        if (!user.getIsActive())
            throw new IllegalArgumentException(
                    "User is already deactivated.");

        user.setIsActive(false);
        userRepository.save(user);

        System.out.println(">>> User deactivated: " + user.getPhone());
        return toResponse(user);
    }

    // ── ACTIVATE USER ─────────────────────────────────────
    @Transactional
    public AdminUserResponse activateUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found with ID: " + userId));

        if (user.getIsActive())
            throw new IllegalArgumentException("User is already active.");

        user.setIsActive(true);
        userRepository.save(user);

        System.out.println(">>> User activated: " + user.getPhone());
        return toResponse(user);
    }

    // ── HELPERS ───────────────────────────────────────────
    private AdminUserResponse toResponse(User user) {
        AdminUserResponse.AdminUserResponseBuilder builder =
                AdminUserResponse.builder()
                        .userId(user.getId())
                        .name(user.getName())
                        .phone(user.getPhone())
                        .role(user.getRole().name())
                        .isVerified(user.getIsVerified())
                        .isActive(user.getIsActive())
                        .createdAt(user.getCreatedAt())
                        .updatedAt(user.getUpdatedAt());

        // Attach farmer-specific fields
        if (user.getRole() == Role.FARMER) {
            farmerRepository.findById(user.getId()).ifPresent(f -> {
                builder.district(f.getDistrict());
                builder.address(f.getAddress());
            });
        }

        // Attach agency-specific fields
        if (user.getRole() == Role.AGENCY) {
            agencyRepository.findById(user.getId()).ifPresent(a -> {
                builder.agentStatus(a.getStatus().name());
                builder.averageRating(a.getAverageRating());
                builder.address(a.getAddress());
            });
        }

        return builder.build();
    }
}
