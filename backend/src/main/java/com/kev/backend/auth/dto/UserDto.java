package com.kev.backend.auth.dto;

import com.kev.backend.auth.User;
import java.util.UUID;

public record UserDto(UUID id, String email, String displayName, String pictureUrl, String role) {

    public static UserDto from(User u) {
        return new UserDto(
                u.getId(),
                u.getEmail(),
                u.getDisplayName(),
                u.getPictureUrl(),
                u.getRole().name());
    }
}
