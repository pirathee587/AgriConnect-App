package com.agriconnect.shared.repository;

import com.agriconnect.shared.entity.PackageVegetable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PackageVegetableRepository extends JpaRepository<PackageVegetable, Long> {
    List<PackageVegetable> findByPkgId(Long packageId);
}