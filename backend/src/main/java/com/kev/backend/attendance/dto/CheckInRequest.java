package com.kev.backend.attendance.dto;

import com.kev.backend.attendance.CheckInMethod;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CheckInRequest(@NotBlank String indexNumber, @NotNull CheckInMethod method) {}
