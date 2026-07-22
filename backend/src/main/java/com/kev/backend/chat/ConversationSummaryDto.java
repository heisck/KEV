package com.kev.backend.chat;

import com.kev.backend.auth.dto.UserDto;

public record ConversationSummaryDto(UserDto peer, MessageDto lastMessage, long unreadCount) {}
