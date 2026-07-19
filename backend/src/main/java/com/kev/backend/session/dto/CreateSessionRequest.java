package com.kev.backend.session.dto;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;
import java.util.List;

public record CreateSessionRequest(
        String title,
        @NotBlank String building,
        String floor,
        String room,
        List<String> courseCodes,
        String indexRangeStart,
        String indexRangeEnd,
        LocalDate examDate,
        String startTime,
        String endTime,
        List<String> verificationMethods) {}
