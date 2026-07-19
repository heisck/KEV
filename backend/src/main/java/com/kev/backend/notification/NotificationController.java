package com.kev.backend.notification;

import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/notifications")
@Tag(name = "Notifications", description = "User activity and notifications")
public class NotificationController {

    private final NotificationRepository notifications;

    public NotificationController(NotificationRepository notifications) {
        this.notifications = notifications;
    }

    @GetMapping
    public List<Notification> list(@AuthenticationPrincipal Jwt principal) {
        if (principal == null) return List.of();
        UUID userId = UUID.fromString(principal.getSubject());
        return notifications.findAllByUserIdOrderByCreatedAtDesc(userId);
    }

    @PostMapping("/{id}/read")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void markRead(@AuthenticationPrincipal Jwt principal, @PathVariable Long id) {
        notifications.findById(id).ifPresent(n -> {
            if (n.getUserId().toString().equals(principal.getSubject())) {
                n.setRead(true);
                notifications.save(n);
            }
        });
    }
}
