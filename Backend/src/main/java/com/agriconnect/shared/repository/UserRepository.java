package com.agriconnect.shared.repository;

import com.agriconnect.shared.entity.User;
import com.agriconnect.shared.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByPhone(String phone);
    Boolean existsByPhone(String phone);

    List<User> findByRole(Role r);
}
