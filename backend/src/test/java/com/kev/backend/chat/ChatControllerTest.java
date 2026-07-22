package com.kev.backend.chat;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import com.kev.backend.auth.Role;
import com.kev.backend.auth.User;
import com.kev.backend.auth.UserRepository;
import com.kev.backend.common.ApiException;
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
    ChatService service;

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

        service.sendMessage(senderId, peerId, new SendMessageRequest("Hello there"));

        ArgumentCaptor<Notification> captor = ArgumentCaptor.forClass(Notification.class);
        verify(notifications).save(captor.capture());
        Notification notification = captor.getValue();
        assertThat(notification.getUserId()).isEqualTo(peerId);
        assertThat(notification.getTitle()).isEqualTo("New message from Dr. Sender");
        assertThat(notification.getMessage()).isEqualTo("Hello there");
        assertThat(notification.getType()).isEqualTo("CHAT:" + senderId);
    }

    @Test
    void lecturerDirectoryExcludesTheSignedInLecturer() {
        UUID senderId = UUID.randomUUID();
        User sender = user(senderId, "Dr. Sender", "sender@kev.app");
        User peer = user(UUID.randomUUID(), "Dr. Peer", "peer@kev.app");
        when(users.findAllByRoleInAndActiveTrue(java.util.List.of(Role.LECTURER, Role.ADMIN)))
                .thenReturn(java.util.List.of(sender, peer));

        var result = service.listLecturers(senderId, null);

        assertThat(result).extracting(u -> u.id()).containsExactly(peer.getId());
    }

    @Test
    void sendingToYourselfIsRejected() {
        UUID senderId = UUID.randomUUID();

        assertThatThrownBy(() -> service.sendMessage(senderId, senderId, new SendMessageRequest("Hello")))
                .isInstanceOf(ApiException.class);
        verifyNoInteractions(conversations, messages, notifications);
    }

    @Test
    void openingConversationMarksIncomingMessagesAndChatNotificationsRead() {
        UUID userId = UUID.randomUUID();
        UUID peerId = UUID.randomUUID();
        Conversation conversation = new Conversation();
        conversation.setId(7L);
        when(conversations.findByUsers(userId, peerId)).thenReturn(Optional.of(conversation));

        service.markRead(userId, peerId);

        verify(messages).markIncomingRead(7L, userId);
        verify(notifications).markTypeRead(userId, "CHAT:" + peerId);
    }

    @Test
    void conversationSummariesIncludeLatestMessageAndUnreadCount() {
        UUID userId = UUID.randomUUID();
        UUID peerId = UUID.randomUUID();
        Conversation conversation = new Conversation();
        conversation.setId(7L);
        conversation.setUser1Id(userId);
        conversation.setUser2Id(peerId);
        Message latest = new Message();
        latest.setId(9L);
        latest.setConversationId(7L);
        latest.setSenderId(peerId);
        latest.setContent("Latest");
        ConversationMessageCount unread = mock(ConversationMessageCount.class);
        when(unread.getConversationId()).thenReturn(7L);
        when(unread.getCount()).thenReturn(2L);
        when(conversations.findAllForUser(userId)).thenReturn(java.util.List.of(conversation));
        when(messages.findLatestByConversationIds(java.util.List.of(7L))).thenReturn(java.util.List.of(latest));
        when(messages.countUnreadByConversationIds(java.util.List.of(7L), userId))
                .thenReturn(java.util.List.of(unread));
        when(users.findAllById(java.util.List.of(peerId)))
                .thenReturn(java.util.List.of(user(peerId, "Dr. Peer", "peer@kev.app")));

        var result = service.listConversations(userId);

        assertThat(result).singleElement().satisfies(summary -> {
            assertThat(summary.peer().id()).isEqualTo(peerId);
            assertThat(summary.lastMessage().content()).isEqualTo("Latest");
            assertThat(summary.unreadCount()).isEqualTo(2L);
        });
    }

    private static User user(UUID id, String name, String email) {
        User user = new User();
        user.setId(id);
        user.setDisplayName(name);
        user.setEmail(email);
        return user;
    }
}
