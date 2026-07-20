package com.kev.backend.chat;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.kev.backend.auth.User;
import com.kev.backend.auth.UserRepository;
import com.kev.backend.notification.Notification;
import com.kev.backend.notification.NotificationRepository;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.oauth2.jwt.Jwt;

@ExtendWith(MockitoExtension.class)
class ChatControllerTest {

    @Mock
    ConversationRepository conversations;

    @Mock
    MessageRepository messages;

    @Mock
    UserRepository users;

    @Mock
    NotificationRepository notifications;

    @InjectMocks
    ChatController controller;

    @Test
    void sendingMessageCreatesRecipientNotificationPreview() {
        UUID senderId = UUID.randomUUID();
        UUID peerId = UUID.randomUUID();
        User sender = user(senderId, "Dr. Sender", "sender@kev.app");
        User peer = user(peerId, "Dr. Peer", "peer@kev.app");
        Conversation conversation = new Conversation();
        conversation.setId(7L);

        when(users.findById(senderId)).thenReturn(Optional.of(sender));
        when(users.findById(peerId)).thenReturn(Optional.of(peer));
        when(conversations.findByUsers(senderId, peerId)).thenReturn(Optional.of(conversation));
        when(messages.save(any(Message.class))).thenAnswer(invocation -> invocation.getArgument(0));

        controller.sendMessage(jwt(senderId), peerId, new SendMessageRequest("Hello there"));

        ArgumentCaptor<Notification> captor = ArgumentCaptor.forClass(Notification.class);
        verify(notifications).save(captor.capture());
        Notification notification = captor.getValue();
        assertThat(notification.getUserId()).isEqualTo(peerId);
        assertThat(notification.getTitle()).isEqualTo("New message from Dr. Sender");
        assertThat(notification.getMessage()).isEqualTo("Hello there");
        assertThat(notification.getType()).isEqualTo("CHAT");
    }

    private static User user(UUID id, String name, String email) {
        User user = new User();
        user.setId(id);
        user.setDisplayName(name);
        user.setEmail(email);
        return user;
    }

    private static Jwt jwt(UUID subject) {
        return Jwt.withTokenValue("token")
                .header("alg", "none")
                .subject(subject.toString())
                .build();
    }
}
