package com.agriconnect.shared.repository;

import com.agriconnect.shared.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findAllByRecipientPhone(String phone);

    List<Notification> findAllByRecipientEmail(String email);

    List<Notification> findAllByEventTypeOrderByCreatedAtDesc(String eventType);
}
