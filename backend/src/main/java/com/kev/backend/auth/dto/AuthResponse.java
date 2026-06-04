package com.kev.backend.auth.dto;

public record AuthResponse(String accessToken, String refreshToken, UserDto user) {}
