package com.kev.backend.common;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.kev.backend.auth.UserRepository;
import com.kev.backend.chat.ChatController;
import com.kev.backend.chat.ConversationRepository;
import com.kev.backend.chat.MessageRepository;
import com.kev.backend.notification.NotificationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.web.method.annotation.AuthenticationPrincipalArgumentResolver;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

@ExtendWith(MockitoExtension.class)
class GlobalExceptionHandlerTest {

    @Mock
    ConversationRepository conversations;

    @Mock
    MessageRepository messages;

    @Mock
    UserRepository users;

    @Mock
    NotificationRepository notifications;

    private MockMvc mvc;

    @BeforeEach
    void setUp() {
        mvc = MockMvcBuilders.standaloneSetup(new ChatController(conversations, messages, users, notifications))
                .setControllerAdvice(new GlobalExceptionHandler())
                .setCustomArgumentResolvers(new AuthenticationPrincipalArgumentResolver())
                .build();
    }

    @Test
    void invalidUuidPathReturnsBadRequest() throws Exception {
        mvc.perform(get("/api/chat/conversations/i1/messages"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Invalid peerId"));
    }
}
