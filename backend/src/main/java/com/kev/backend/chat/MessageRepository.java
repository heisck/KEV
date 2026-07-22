package com.kev.backend.chat;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findAllByConversationIdOrderByCreatedAtAsc(Long conversationId);

    @Query(
            "SELECT message FROM Message message WHERE message.conversationId IN :ids AND message.createdAt = (SELECT MAX(candidate.createdAt) FROM Message candidate WHERE candidate.conversationId = message.conversationId)")
    List<Message> findLatestByConversationIds(@Param("ids") List<Long> conversationIds);

    @Query(
            "SELECT message.conversationId AS conversationId, COUNT(message) AS count FROM Message message WHERE message.conversationId IN :ids AND message.senderId <> :userId AND message.read = false GROUP BY message.conversationId")
    List<ConversationMessageCount> countUnreadByConversationIds(
            @Param("ids") List<Long> conversationIds, @Param("userId") UUID userId);

    @Modifying
    @Query(
            "UPDATE Message message SET message.read = true WHERE message.conversationId = :conversationId AND message.senderId <> :userId AND message.read = false")
    int markIncomingRead(@Param("conversationId") Long conversationId, @Param("userId") UUID userId);
}
