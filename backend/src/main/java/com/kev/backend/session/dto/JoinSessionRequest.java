package com.kev.backend.session.dto;

public record JoinSessionRequest(String sessionCode, String sessionPassword) {
    public String getEffectiveCodeOrPassword() {
        if (sessionPassword != null && !sessionPassword.isBlank()) return sessionPassword.trim();
        if (sessionCode != null && !sessionCode.isBlank()) return sessionCode.trim();
        return "";
    }
}
