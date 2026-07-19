package com.kev.backend.admin.dto;

import com.kev.backend.auth.dto.UserDto;
import com.kev.backend.session.dto.SessionDto;
import java.util.List;

public record AdminDashboardDto(
        long totalLecturers,
        long activeLecturers,
        long totalSessions,
        List<SessionDto> recentSessions,
        List<UserDto> recentLecturers) {}
