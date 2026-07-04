package com.kev.backend.admin.dto;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record AssignInvigilatorRequest(@NotNull UUID userId) {}
