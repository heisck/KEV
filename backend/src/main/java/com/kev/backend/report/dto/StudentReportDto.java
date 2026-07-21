package com.kev.backend.report.dto;

import com.kev.backend.directory.dto.StudentRecord;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record StudentReportDto(
        Long id,
        Long sessionId,
        String sessionTitle,
        String sessionCode,
        LocalDate examDate,
        UUID authorId,
        String authorName,
        String authorEmail,
        StudentRecord student,
        String message,
        Instant createdAt,
        boolean read) {}
