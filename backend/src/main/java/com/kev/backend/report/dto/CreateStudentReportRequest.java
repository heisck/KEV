package com.kev.backend.report.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record CreateStudentReportRequest(
        Long sessionId, @Positive Long studentId, @NotBlank @Size(max = 2000) String message) {}
