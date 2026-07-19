package com.kev.backend.chat;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ConversationRepository extends JpaRepository<Conversation, Long> {

    @Query("SELECT c FROM Conversation c WHERE (c.user1Id = :u1 AND c.user2Id = :u2) OR (c.user1Id = :u2 AND c.user2Id = :u1)")
    Optional<Conversation> findByUsers(@Param("u1") UUID u1, @Param("u2") UUID u2);
}
