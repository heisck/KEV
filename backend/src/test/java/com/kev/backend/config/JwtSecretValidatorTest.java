package com.kev.backend.config;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.Duration;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.mock.env.MockEnvironment;

class JwtSecretValidatorTest {

    private static AppProperties propsWithSecret(String secret) {
        return new AppProperties(
                new AppProperties.Auth(
                        new AppProperties.Jwt(secret, "kev", Duration.ofMinutes(15), Duration.ofDays(30)),
                        new AppProperties.Google(List.of("client")),
                        new AppProperties.Apple(List.of("com.kev.app"))),
                new AppProperties.Cors(List.of("http://localhost")));
    }

    private static void validate(String secret, String... profiles) {
        MockEnvironment env = new MockEnvironment();
        env.setActiveProfiles(profiles);
        new JwtSecretValidator(propsWithSecret(secret), env).onApplicationEvent(null);
    }

    @Test
    void skipsValidationOutsideProd() {
        assertThatCode(() -> validate("changeme-dev-secret-please-override-min-32-bytes!!"))
                .doesNotThrowAnyException();
        assertThatCode(() -> validate("short", "dev")).doesNotThrowAnyException();
    }

    @Test
    void rejectsDefaultPlaceholderInProd() {
        assertThatThrownBy(() -> validate("changeme-dev-secret-please-override-min-32-bytes!!", "prod"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("placeholder");
    }

    @Test
    void rejectsShortSecretInProd() {
        assertThatThrownBy(() -> validate("too-short-secret", "prod"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("32 bytes");
    }

    @Test
    void rejectsBlankSecretInProd() {
        assertThatThrownBy(() -> validate("  ", "prod")).isInstanceOf(IllegalStateException.class);
    }

    @Test
    void acceptsStrongSecretInProd() {
        assertThatCode(() -> validate("a-sufficiently-long-random-production-secret-value-123", "prod"))
                .doesNotThrowAnyException();
    }
}
