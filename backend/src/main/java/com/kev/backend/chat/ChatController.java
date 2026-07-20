package com.kev.backend.chat;

import com.kev.backend.auth.Role;
import com.kev.backend.auth.UserRepository;
import com.kev.backend.auth.dto.UserDto;
import com.kev.backend.common.ApiException;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/chat")
@Tag(name = "Chat", description = "Lecturer directory messaging")
public class ChatController {

    private final ConversationRepository conversations;
    private final MessageRepository messages;
    private final UserRepository users;

    public ChatController(ConversationRepository conversations, MessageRepository messages, UserRepository users) {
        this.conversations = conversations;
        this.messages = messages;
        this.users = users;
    }

    @GetMapping("/lecturers")
    @Transactional(readOnly = true)
    public List<UserDto> listLecturers(@RequestParam(required = false) String q) {
        return users.findAll().stream()
                .filter(u -> u.getRole() == Role.LECTURER || u.getRole() == Role.ADMIN)
                .filter(u -> q == null
                        || q.isBlank()
                        || (u.getDisplayName() != null
                                && u.getDisplayName()
                                        .toLowerCase()
                                        .contains(q.trim().toLowerCase()))
                        || (u.getEmail() != null
                                && u.getEmail().toLowerCase().contains(q.trim().toLowerCase())))
                .map(UserDto::from)
                .toList();
    }

    @GetMapping("/conversations/{peerId}/messages")
    @Transactional(readOnly = true)
    public List<MessageDto> getMessages(@AuthenticationPrincipal Jwt principal, @PathVariable UUID peerId) {
        if (principal == null) return List.of();
        UUID userId = UUID.fromString(principal.getSubject());
        return conversations
                .findByUsers(userId, peerId)
                .map(c -> messages.findAllByConversationIdOrderByCreatedAtAsc(c.getId()).stream()
                        .map(MessageDto::from)
                        .toList())
                .orElse(List.of());
    }

    @PostMapping("/conversations/{peerId}/messages")
    @Transactional
    public MessageDto sendMessage(
            @AuthenticationPrincipal Jwt principal,
            @PathVariable UUID peerId,
            @Valid @RequestBody SendMessageRequest req) {
        if (principal == null) throw new ApiException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        UUID userId = UUID.fromString(principal.getSubject());
        users.findById(peerId).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Peer not found"));

        Conversation conv = conversations.findByUsers(userId, peerId).orElseGet(() -> {
            Conversation c = new Conversation();
            c.setUser1Id(userId);
            c.setUser2Id(peerId);
            return conversations.save(c);
        });

        conv.setUpdatedAt(Instant.now());
        conversations.save(conv);

        Message msg = new Message();
        msg.setConversationId(conv.getId());
        msg.setSenderId(userId);
        msg.setContent(req.content().trim());
        Message saved = messages.save(msg);
        return MessageDto.from(saved);
    }
}
