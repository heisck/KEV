package com.kev.backend.session.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public record CreateSessionRequest(
        @NotBlank String building,
        String floor,
        String room,
        @NotEmpty List<String> courseCodes,
        String indexRangeStart,
        String indexRangeEnd) {}
