package com.agriconnect.farmer.pkg.service;

import com.agriconnect.farmer.pkg.dto.*;
import com.agriconnect.shared.entity.*;
import com.agriconnect.shared.entity.Package;
import com.agriconnect.shared.exception.ResourceNotFoundException;
import com.agriconnect.shared.repository.PackageRepository;
import com.agriconnect.shared.repository.PackageVegetableRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FarmerPackageService {

    private final PackageRepository          packageRepository;
    private final PackageVegetableRepository pvRepository;

    public List<FarmerPackageListResponse> getAllAvailable() {
        return packageRepository.findAllAvailable(LocalDateTime.now())
                .stream().map(this::toListResponse)
                .collect(Collectors.toList());
    }

    public List<FarmerPackageListResponse> getByMarket(String market) {
        return packageRepository.findAvailableByMarket(market, LocalDateTime.now())
                .stream().map(this::toListResponse)
                .collect(Collectors.toList());
    }

    public FarmerPackageDetailResponse getById(Long packageId) {
        com.agriconnect.shared.entity.Package pkg = packageRepository.findById(packageId)
                .orElseThrow(() -> new ResourceNotFoundException("Package not found"));
        return toDetailResponse(pkg);
    }

    private FarmerPackageListResponse toListResponse(com.agriconnect.shared.entity.Package pkg) {
        List<PackageVegetable> vegs = pvRepository.findByPkgId(pkg.getId());

        return FarmerPackageListResponse.builder()
                .packageId(pkg.getId())
                .marketDestination(pkg.getMarketDestination())
                .travelDateTime(pkg.getTravelDateTime())
                .pickupWindowStart(pkg.getPickupWindowStart())
                .remainingCapacityKg(pkg.getRemainingCapacityKg())
                .status(pkg.getStatus().name())
                .agentName(pkg.getAgency().getUser().getName())
                .agentPhone(pkg.getAgency().getUser().getPhone())
                .agentRating(pkg.getAgency().getAverageRating())
                .agentTotalRatings(pkg.getAgency().getTotalRatings())
                .vegetables(vegs.stream().map(v ->
                        FarmerPackageListResponse.VegSummary.builder()
                                .vegetableName(v.getVegetableName())
                                .pricePerKg(v.getPricePerKg())
                                .remainingKg(v.getRemainingKg())
                                .build()).collect(Collectors.toList()))
                .build();
    }

    private FarmerPackageDetailResponse toDetailResponse(com.agriconnect.shared.entity.Package pkg) {
        List<PackageVegetable> vegs = pvRepository.findByPkgId(pkg.getId());

        return FarmerPackageDetailResponse.builder()
                .packageId(pkg.getId())
                .marketDestination(pkg.getMarketDestination())
                .travelDateTime(pkg.getTravelDateTime())
                .pickupWindowStart(pkg.getPickupWindowStart())
                .pickupWindowEnd(pkg.getPickupWindowEnd())
                .vehicleType(pkg.getVehicleType())
                .vehicleNumber(pkg.getVehicleNumber())
                .totalCapacityKg(pkg.getTotalCapacityKg())
                .remainingCapacityKg(pkg.getRemainingCapacityKg())
                .status(pkg.getStatus().name())
                .agentName(pkg.getAgency().getUser().getName())
                .agentPhone(pkg.getAgency().getUser().getPhone())
                .agentRating(pkg.getAgency().getAverageRating())
                .agentTotalRatings(pkg.getAgency().getTotalRatings())
                .vegetables(vegs.stream().map(v ->
                        FarmerPackageDetailResponse.VegDetail.builder()
                                .vegetableId(v.getId())
                                .vegetableName(v.getVegetableName())
                                .pricePerKg(v.getPricePerKg())
                                .maxKg(v.getMaxKg())
                                .remainingKg(v.getRemainingKg())
                                .priceUpdatedAt(v.getPriceUpdatedAt())
                                .build()).collect(Collectors.toList()))
                .build();
    }
}
