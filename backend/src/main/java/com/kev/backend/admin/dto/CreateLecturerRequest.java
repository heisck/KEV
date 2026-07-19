package com.kev.backend.admin.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record CreateLecturerRequest(
        @NotBlank String fullName,
        @NotBlank String lecturerId,
        @NotBlank @Email String universityEmail,
        @NotBlank @Email String personalEmail,
        @NotBlank String phone) {}
