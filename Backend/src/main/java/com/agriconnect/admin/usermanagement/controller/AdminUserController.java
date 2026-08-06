package com.agriconnect.admin.usermanagement.controller;

import com.agriconnect.admin.usermanagement.dto.*;
import com.agriconnect.admin.usermanagement.service.AdminUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private final AdminUserService adminUserService;

    @GetMapping
    public ResponseEntity<AdminUserListResponse> getAll() {
        return ResponseEntity.ok(adminUserService.getAllUsers());
    }

    @GetMapping("/role/{role}")
    public ResponseEntity<List<AdminUserResponse>> getByRole(
            @PathVariable String role) {
        return ResponseEntity.ok(adminUserService.getUsersByRole(role));
    }

    @GetMapping("/{userId}")
    public ResponseEntity<AdminUserResponse> getById(
            @PathVariable Long userId) {
        return ResponseEntity.ok(adminUserService.getUserById(userId));
    }

    @GetMapping("/phone/{phone}")
    public ResponseEntity<AdminUserResponse> getByPhone(
            @PathVariable String phone) {
        return ResponseEntity.ok(adminUserService.getUserByPhone(phone));
    }

    @PostMapping("/{userId}/deactivate")
    public ResponseEntity<AdminUserResponse> deactivate(
            @PathVariable Long userId) {
        return ResponseEntity.ok(adminUserService.deactivateUser(userId));
    }

    @PostMapping("/{userId}/activate")
    public ResponseEntity<AdminUserResponse> activate(
            @PathVariable Long userId) {
        return ResponseEntity.ok(adminUserService.activateUser(userId));
    }
}