package com.kev.backend.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateCredentialsRequest(
        @NotBlank String currentPassword,
        @Email @Size(max = 320) String email,
        @Size(min = 8, max = 72) String newPassword) {}
