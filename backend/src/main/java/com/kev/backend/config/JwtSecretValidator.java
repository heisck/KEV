package com.kev.backend.config;

import java.nio.charset.StandardCharsets;
import java.util.Set;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.ApplicationListener;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

/**
 * Fails fast when the app boots with the {@code prod} profile but no proper JWT
 * signing secret: the placeholder ships as a convenience for local dev, and a
 * deployment that forgets to set {@code JWT_SECRET} would otherwise sign tokens
 * with a publicly known key — letting anyone forge admin tokens. HS256 also
 * requires at least 256 bits (32 bytes) of key material.
 */
@Component
public class JwtSecretValidator implements ApplicationListener<ApplicationReadyEvent> {

    private static final int MIN_SECRET_BYTES = 32;
    private static final Set<String> KNOWN_WEAK_SECRETS = Set.of(
            "changeme-dev-secret-please-override-min-32-bytes!!",
            "changeme-generate-a-long-random-secret-min-32-bytes");

    private final AppProperties props;
    private final Environment environment;

    public JwtSecretValidator(AppProperties props, Environment environment) {
        this.props = props;
        this.environment = environment;
    }

    @Override
    public void onApplicationEvent(ApplicationReadyEvent event) {
        if (!environment.matchesProfiles("prod")) {
            return;
        }
        String secret = props.auth().jwt().secret();
        if (secret == null || secret.isBlank()) {
            throw new IllegalStateException("JWT_SECRET must be set in production");
        }
        if (KNOWN_WEAK_SECRETS.contains(secret)) {
            throw new IllegalStateException(
                    "JWT_SECRET is still the default placeholder — set a strong random secret in production");
        }
        if (secret.getBytes(StandardCharsets.UTF_8).length < MIN_SECRET_BYTES) {
            throw new IllegalStateException(
                    "JWT_SECRET must be at least " + MIN_SECRET_BYTES + " bytes for HS256 in production");
        }
    }
}
