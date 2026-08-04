package com.kev.backend.attendance.dto;

import com.kev.backend.attendance.CheckInMethod;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CheckInRequest(
        @Size(max = 30) String indexNumber, @Size(max = 128) String nfcUid, @NotNull CheckInMethod method) {}
