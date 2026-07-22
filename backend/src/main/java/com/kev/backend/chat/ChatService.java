package com.kev.backend.chat;

import com.kev.backend.auth.Role;
import com.kev.backend.auth.User;
import com.kev.backend.auth.UserRepository;
import com.kev.backend.auth.dto.UserDto;
import com.kev.backend.common.ApiException;
import com.kev.backend.notification.Notification;
import com.kev.backend.notification.NotificationRepository;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ChatService {

    private final ConversationRepository conversations;
    private final MessageRepository messages;
    private final UserRepository users;
    private final NotificationRepository notifications;

    public ChatService(
            ConversationRepository conversations,
            MessageRepository messages,
            UserRepository users,
            NotificationRepository notifications) {
        this.conversations = conversations;
        this.messages = messages;
        this.users = users;
        this.notifications = notifications;
    }

    @Transactional(readOnly = true)
    public List<UserDto> listLecturers(UUID userId, String query) {
        String normalized = query != null ? query.trim().toLowerCase() : "";
        return users.findAllByRoleInAndActiveTrue(List.of(Role.LECTURER, Role.ADMIN)).stream()
                .filter(user -> !userId.equals(user.getId()))
                .filter(user -> normalized.isBlank() || matches(user, normalized))
                .map(UserDto::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<MessageDto> getMessages(UUID userId, UUID peerId) {
        return conversations
                .findByUsers(userId, peerId)
                .map(conversation -> messages.findAllByConversationIdOrderByCreatedAtAsc(conversation.getId()).stream()
                        .map(MessageDto::from)
                        .toList())
                .orElse(List.of());
    }

    @Transactional(readOnly = true)
    public List<ConversationSummaryDto> listConversations(UUID userId) {
        List<Conversation> items = conversations.findAllForUser(userId);
        if (items.isEmpty()) return List.of();
        List<Long> ids = items.stream().map(Conversation::getId).toList();
        Map<Long, Message> latest = messages.findLatestByConversationIds(ids).stream()
                .collect(Collectors.toMap(Message::getConversationId, Function.identity(), ChatService::newer));
        Map<Long, Long> unread = messages.countUnreadByConversationIds(ids, userId).stream()
                .collect(Collectors.toMap(
                        ConversationMessageCount::getConversationId, ConversationMessageCount::getCount));
        Map<UUID, User> peers = users
                .findAllById(items.stream().map(item -> peerId(item, userId)).toList())
                .stream()
                .collect(Collectors.toMap(User::getId, Function.identity()));
        return items.stream()
                .map(item -> summary(item, userId, peers, latest, unread))
                .filter(java.util.Objects::nonNull)
                .toList();
    }

    @Transactional
    public MessageDto sendMessage(UUID userId, UUID peerId, SendMessageRequest request) {
        if (peerId.equals(userId)) throw new ApiException(HttpStatus.BAD_REQUEST, "You cannot message yourself");
        users.findById(peerId).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Peer not found"));
        User sender =
                users.findById(userId).orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Unauthorized"));
        Conversation conversation = conversations.findByUsers(userId, peerId).orElseGet(() -> create(userId, peerId));
        conversation.setUpdatedAt(Instant.now());
        conversations.save(conversation);
        Message message = new Message();
        message.setConversationId(conversation.getId());
        message.setSenderId(userId);
        message.setContent(request.content().trim());
        Message saved = messages.save(message);
        notifications.save(chatNotification(peerId, userId, sender, saved));
        return MessageDto.from(saved);
    }

    @Transactional
    public void markRead(UUID userId, UUID peerId) {
        conversations.findByUsers(userId, peerId).ifPresent(conversation -> {
            messages.markIncomingRead(conversation.getId(), userId);
            notifications.markTypeRead(userId, "CHAT:" + peerId);
        });
    }

    private Conversation create(UUID userId, UUID peerId) {
        Conversation conversation = new Conversation();
        conversation.setUser1Id(userId);
        conversation.setUser2Id(peerId);
        return conversations.save(conversation);
    }

    private Notification chatNotification(UUID peerId, UUID senderId, User sender, Message message) {
        Notification notification = new Notification();
        notification.setUserId(peerId);
        notification.setTitle("New message from " + displayName(sender));
        notification.setMessage(message.getContent());
        notification.setType("CHAT:" + senderId);
        return notification;
    }

    private static ConversationSummaryDto summary(
            Conversation conversation,
            UUID userId,
            Map<UUID, User> peers,
            Map<Long, Message> latest,
            Map<Long, Long> unread) {
        User peer = peers.get(peerId(conversation, userId));
        Message message = latest.get(conversation.getId());
        if (peer == null || message == null) return null;
        return new ConversationSummaryDto(
                UserDto.from(peer), MessageDto.from(message), unread.getOrDefault(conversation.getId(), 0L));
    }

    private static UUID peerId(Conversation conversation, UUID userId) {
        return userId.equals(conversation.getUser1Id()) ? conversation.getUser2Id() : conversation.getUser1Id();
    }

    private static Message newer(Message first, Message second) {
        return first.getCreatedAt().isAfter(second.getCreatedAt()) ? first : second;
    }

    private static boolean matches(User user, String query) {
        return (user.getDisplayName() != null
                        && user.getDisplayName().toLowerCase().contains(query))
                || user.getEmail().toLowerCase().contains(query);
    }

    private static String displayName(User user) {
        return user.getDisplayName() == null || user.getDisplayName().isBlank()
                ? user.getEmail()
                : user.getDisplayName();
    }
}
