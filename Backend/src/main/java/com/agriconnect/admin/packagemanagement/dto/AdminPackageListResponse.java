package com.agriconnect.admin.packagemanagement.dto;

import lombok.*;
import java.util.List;
import java.util.Map;

@Data @Builder @AllArgsConstructor @NoArgsConstructor
public class AdminPackageListResponse {
    private Long totalPackages;
    private Long openPackages;
    private Long fullPackages;
    private Long inTransitPackages;
    private Long deliveredPackages;
    private Long cancelledPackages;
    private Map<String, Long> packagesByMarket;
    private List<AdminPackageResponse> packages;
}
