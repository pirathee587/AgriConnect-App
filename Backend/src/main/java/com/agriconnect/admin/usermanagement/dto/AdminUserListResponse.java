package com.agriconnect.admin.usermanagement.dto;

import lombok.*;
import java.util.List;

@Data @Builder @AllArgsConstructor @NoArgsConstructor
public class AdminUserListResponse {
    private Long totalUsers;
    private Long totalFarmers;
    private Long totalAgents;
    private Long totalAdmins;
    private Long activeUsers;
    private Long inactiveUsers;
    private List<AdminUserResponse> users;
}
