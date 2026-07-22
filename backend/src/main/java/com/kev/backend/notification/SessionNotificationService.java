package com.kev.backend.notification;

import com.kev.backend.auth.Role;
import com.kev.backend.auth.UserRepository;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;

@Service
public class SessionNotificationService {

    private final UserRepository users;
    private final NotificationRepository notifications;

    public SessionNotificationService(UserRepository users, NotificationRepository notifications) {
        this.users = users;
        this.notifications = notifications;
    }

    /** Sends a session event to every active lecturer and administrator. */
    public void notifyLecturers(Long sessionId, String title, String message) {
        List<Notification> items = users.findAllByRoleInAndActiveTrue(List.of(Role.LECTURER, Role.ADMIN)).stream()
                .map(user -> notification(sessionId, user.getId(), title, message))
                .toList();
        if (!items.isEmpty()) notifications.saveAll(items);
    }

    private Notification notification(Long sessionId, UUID userId, String title, String message) {
        Notification notification = new Notification();
        notification.setUserId(userId);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType("SESSION:" + sessionId);
        return notification;
    }
}
