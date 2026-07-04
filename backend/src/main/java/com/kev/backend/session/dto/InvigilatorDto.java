package com.kev.backend.session.dto;

import java.time.Instant;
import java.util.UUID;

public record InvigilatorDto(
        UUID userId, String displayName, String email, String pictureUrl, Instant joinedAt, boolean assignedByAdmin) {}
