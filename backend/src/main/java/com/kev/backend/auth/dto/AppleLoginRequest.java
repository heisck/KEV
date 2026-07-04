package com.kev.backend.auth.dto;

import jakarta.validation.constraints.NotBlank;

/** Apple tokens carry no name — the client passes it on first sign-in when Apple provides it. */
public record AppleLoginRequest(@NotBlank String identityToken, String fullName) {}
