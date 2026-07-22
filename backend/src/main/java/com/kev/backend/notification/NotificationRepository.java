package com.kev.backend.notification;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findAllByUserIdOrderByCreatedAtDesc(UUID userId);

    @Modifying
    @Query(
            "UPDATE Notification notification SET notification.read = true WHERE notification.userId = :userId AND notification.type = :type AND notification.read = false")
    int markTypeRead(@Param("userId") UUID userId, @Param("type") String type);
}
