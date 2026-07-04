package com.kev.backend.auth;

import com.kev.backend.auth.dto.AuthResponse;
import com.kev.backend.auth.dto.TokenResponse;
import com.kev.backend.auth.dto.UserDto;
import com.kev.backend.common.ApiException;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final GoogleTokenVerifier google;
    private final UserRepository users;
    private final JwtService jwt;
    private final JwtDecoder jwtDecoder;
    private final PasswordEncoder passwordEncoder;

    public AuthService(
            GoogleTokenVerifier google,
            UserRepository users,
            JwtService jwt,
            JwtDecoder jwtDecoder,
            PasswordEncoder passwordEncoder) {
        this.google = google;
        this.users = users;
        this.jwt = jwt;
        this.jwtDecoder = jwtDecoder;
        this.passwordEncoder = passwordEncoder;
    }

    /** Verify the Google ID token, upsert the user, and mint our access + refresh tokens. */
    @Transactional
    public AuthResponse loginWithGoogle(String idToken) {
        GoogleTokenVerifier.GoogleUser g = google.verify(idToken);
        User user = users.findByGoogleSub(g.sub())
                .or(() -> users.findByEmail(g.email()))
                .map(existing -> {
                    existing.setGoogleSub(g.sub());
                    existing.setDisplayName(g.name());
                    existing.setPictureUrl(g.pictureUrl());
                    return existing;
                })
                .orElseGet(() -> {
                    User u = new User();
                    u.setEmail(g.email());
                    u.setGoogleSub(g.sub());
                    u.setDisplayName(g.name());
                    u.setPictureUrl(g.pictureUrl());
                    u.setRole(Role.USER);
                    return u;
                });
        User saved = users.save(user);
        return new AuthResponse(jwt.issueAccessToken(saved), jwt.issueRefreshToken(saved), UserDto.from(saved));
    }

    /** Create an email/password account. Role is always USER; admins are provisioned via seed. */
    @Transactional
    public AuthResponse registerWithPassword(String email, String name, String password) {
        String normalized = email.trim().toLowerCase();
        if (users.findByEmail(normalized).isPresent()) {
            throw new ApiException(HttpStatus.CONFLICT, "An account with this email already exists");
        }
        User user = new User();
        user.setEmail(normalized);
        user.setDisplayName(name.trim());
        user.setRole(Role.USER);
        user.setPasswordHash(passwordEncoder.encode(password));
        User saved = users.save(user);
        return new AuthResponse(jwt.issueAccessToken(saved), jwt.issueRefreshToken(saved), UserDto.from(saved));
    }

    /** Email/password sign-in for accounts with a password set (e.g. the seeded admin). */
    @Transactional(readOnly = true)
    public AuthResponse loginWithPassword(String email, String password) {
        User user = users.findByEmail(email.trim().toLowerCase())
                .filter(u -> u.getPasswordHash() != null && passwordEncoder.matches(password, u.getPasswordHash()))
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Invalid email or password"));
        return new AuthResponse(jwt.issueAccessToken(user), jwt.issueRefreshToken(user), UserDto.from(user));
    }

    /** Exchange a valid refresh token for a fresh access token. */
    @Transactional(readOnly = true)
    public TokenResponse refresh(String refreshToken) {
        Jwt decoded;
        try {
            decoded = jwtDecoder.decode(refreshToken);
        } catch (JwtException e) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid refresh token");
        }
        if (!JwtService.TokenType.REFRESH.name().equals(decoded.getClaimAsString(JwtService.CLAIM_TYPE))) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Not a refresh token");
        }
        User user = users.findById(UUID.fromString(decoded.getSubject()))
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "User not found"));
        return new TokenResponse(jwt.issueAccessToken(user));
    }

    @Transactional(readOnly = true)
    public UserDto me(UUID userId) {
        return users.findById(userId)
                .map(UserDto::from)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
    }
}
