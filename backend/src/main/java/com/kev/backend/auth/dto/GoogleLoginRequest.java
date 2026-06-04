package com.kev.backend.auth.dto;

import jakarta.validation.constraints.NotBlank;

/** Google ID token obtained on-device via @react-native-google-signin. */
public record GoogleLoginRequest(@NotBlank String idToken) {}
