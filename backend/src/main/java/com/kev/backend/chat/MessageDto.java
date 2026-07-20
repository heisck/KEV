package com.kev.backend.chat;

import java.time.Instant;
import java.util.UUID;

public record MessageDto(Long id, Long conversationId, UUID senderId, String content, boolean read, Instant createdAt) {
    public static MessageDto from(Message m) {
        return new MessageDto(
                m.getId(), m.getConversationId(), m.getSenderId(), m.getContent(), m.isRead(), m.getCreatedAt());
    }
}
