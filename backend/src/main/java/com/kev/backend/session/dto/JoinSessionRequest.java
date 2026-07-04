package com.kev.backend.session.dto;

import jakarta.validation.constraints.NotBlank;

public record JoinSessionRequest(@NotBlank String sessionCode) {}
