package com.kev.backend.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.kev.backend.auth.dto.UpdateCredentialsRequest;
import com.kev.backend.auth.dto.UserDto;
import com.kev.backend.common.ApiException;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.JwtDecoder;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    GoogleTokenVerifier google;

    @Mock
    AppleTokenVerifier apple;

    @Mock
    UserRepository users;

    @Mock
    JwtService jwt;

    @Mock
    JwtDecoder jwtDecoder;

    @Mock
    PasswordEncoder passwordEncoder;

    @InjectMocks
    AuthService service;

    @Test
    void updateCredentialsRequiresCurrentPassword() {
        User user = passwordUser();
        when(users.findById(user.getId())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong", user.getPasswordHash())).thenReturn(false);

        assertThatThrownBy(() -> service.updateCredentials(
                        user.getId(), new UpdateCredentialsRequest("wrong", "new@example.com", null)))
                .isInstanceOf(ApiException.class)
                .satisfies(
                        error -> assertThat(((ApiException) error).getStatus()).isEqualTo(HttpStatus.UNAUTHORIZED));
    }

    @Test
    void updateCredentialsChangesNormalizedEmailAndPassword() {
        User user = passwordUser();
        when(users.findById(user.getId())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("current-pass", user.getPasswordHash())).thenReturn(true);
        when(users.findByEmail("new@example.com")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("new-password")).thenReturn("new-hash");
        when(users.save(user)).thenReturn(user);

        UserDto result = service.updateCredentials(
                user.getId(), new UpdateCredentialsRequest("current-pass", " New@Example.com ", "new-password"));

        assertThat(result.email()).isEqualTo("new@example.com");
        assertThat(user.getPasswordHash()).isEqualTo("new-hash");
        verify(users).save(user);
    }

    @Test
    void updateCredentialsRejectsAnotherUsersEmail() {
        User user = passwordUser();
        User other = passwordUser();
        other.setId(UUID.randomUUID());
        when(users.findById(user.getId())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("current-pass", user.getPasswordHash())).thenReturn(true);
        when(users.findByEmail("taken@example.com")).thenReturn(Optional.of(other));

        assertThatThrownBy(() -> service.updateCredentials(
                        user.getId(), new UpdateCredentialsRequest("current-pass", "taken@example.com", null)))
                .isInstanceOf(ApiException.class)
                .satisfies(
                        error -> assertThat(((ApiException) error).getStatus()).isEqualTo(HttpStatus.CONFLICT));
    }

    private User passwordUser() {
        User user = new User();
        user.setId(UUID.randomUUID());
        user.setEmail("lecturer@example.com");
        user.setDisplayName("Lecturer");
        user.setPasswordHash("current-hash");
        return user;
    }
}
