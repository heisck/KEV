package com.kev.backend.notification;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.kev.backend.auth.Role;
import com.kev.backend.auth.User;
import com.kev.backend.auth.UserRepository;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class SessionNotificationServiceTest {

    @Mock
    UserRepository users;

    @Mock
    NotificationRepository notifications;

    @InjectMocks
    SessionNotificationService service;

    @Test
    void sendsTargetedReminderToEveryActiveLecturer() {
        UUID lecturerId = UUID.randomUUID();
        User lecturer = new User();
        lecturer.setId(lecturerId);
        when(users.findAllByRoleInAndActiveTrue(List.of(Role.LECTURER, Role.ADMIN)))
                .thenReturn(List.of(lecturer));

        service.notifyLecturers(12L, "Session created", "Algorithms is now available");

        ArgumentCaptor<Iterable<Notification>> captor = ArgumentCaptor.captor();
        verify(notifications).saveAll(captor.capture());
        assertThat(captor.getValue()).singleElement().satisfies(notification -> {
            assertThat(notification.getUserId()).isEqualTo(lecturerId);
            assertThat(notification.getTitle()).isEqualTo("Session created");
            assertThat(notification.getMessage()).isEqualTo("Algorithms is now available");
            assertThat(notification.getType()).isEqualTo("SESSION:12");
        });
    }
}
