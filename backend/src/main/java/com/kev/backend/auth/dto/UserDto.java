package com.kev.backend.auth.dto;

import com.kev.backend.auth.User;
import java.time.Instant;
import java.util.UUID;

public record UserDto(
        UUID id,
        String email,
        String displayName,
        String pictureUrl,
        String role,
        String plan,
        String lecturerId,
        String personalEmail,
        String phone,
        String status,
        Boolean active,
        Instant createdAt) {

    public static UserDto from(User u) {
        return new UserDto(
                u.getId(),
                u.getEmail(),
                u.getDisplayName(),
                u.getPictureUrl(),
                u.getRole().name(),
                u.getPlan().name(),
                u.getLecturerId(),
                u.getPersonalEmail(),
                u.getPhone(),
                u.getStatus(),
                u.isActive(),
                u.getCreatedAt());
    }
}
