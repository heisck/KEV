package com.kev.backend.chat;

import com.kev.backend.auth.dto.UserDto;
import com.kev.backend.common.ApiException;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
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

    private final ChatService chat;

    public ChatController(ChatService chat) {
        this.chat = chat;
    }

    @GetMapping("/lecturers")
    public List<UserDto> listLecturers(
            @AuthenticationPrincipal Jwt principal, @RequestParam(required = false) String q) {
        return chat.listLecturers(userId(principal), q);
    }

    @GetMapping("/conversations/{peerId}/messages")
    public List<MessageDto> getMessages(@AuthenticationPrincipal Jwt principal, @PathVariable UUID peerId) {
        return chat.getMessages(userId(principal), peerId);
    }

    @GetMapping("/conversations")
    public List<ConversationSummaryDto> listConversations(@AuthenticationPrincipal Jwt principal) {
        return chat.listConversations(userId(principal));
    }

    @PostMapping("/conversations/{peerId}/messages")
    public MessageDto sendMessage(
            @AuthenticationPrincipal Jwt principal,
            @PathVariable UUID peerId,
            @Valid @RequestBody SendMessageRequest req) {
        return chat.sendMessage(userId(principal), peerId, req);
    }

    @PostMapping("/conversations/{peerId}/read")
    public void markRead(@AuthenticationPrincipal Jwt principal, @PathVariable UUID peerId) {
        chat.markRead(userId(principal), peerId);
    }

    private static UUID userId(Jwt principal) {
        if (principal == null) throw new ApiException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        return UUID.fromString(principal.getSubject());
    }
}
