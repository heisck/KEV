package com.kev.backend.auth.web;

import com.kev.backend.auth.AuthService;
import com.kev.backend.auth.dto.AuthResponse;
import com.kev.backend.auth.dto.GoogleLoginRequest;
import com.kev.backend.auth.dto.RefreshRequest;
import com.kev.backend.auth.dto.TokenResponse;
import com.kev.backend.auth.dto.UserDto;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Auth", description = "Google sign-in exchanged for app JWTs")
public class AuthController {

    private final AuthService auth;

    public AuthController(AuthService auth) {
        this.auth = auth;
    }

    @PostMapping("/google")
    public AuthResponse google(@Valid @RequestBody GoogleLoginRequest request) {
        return auth.loginWithGoogle(request.idToken());
    }

    @PostMapping("/refresh")
    public TokenResponse refresh(@Valid @RequestBody RefreshRequest request) {
        return auth.refresh(request.refreshToken());
    }

    @GetMapping("/me")
    public UserDto me(@AuthenticationPrincipal Jwt principal) {
        return auth.me(UUID.fromString(principal.getSubject()));
    }
}
