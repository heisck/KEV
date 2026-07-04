package com.kev.backend.config;

import java.time.Duration;
import java.util.List;
import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Strongly-typed application configuration bound from the {@code kev.*} namespace
 * in application.yml (which in turn reads environment variables).
 */
@ConfigurationProperties(prefix = "kev")
public record AppProperties(Auth auth, Cors cors) {

    public record Auth(Jwt jwt, Google google, Apple apple) {}

    public record Jwt(String secret, String issuer, Duration accessTtl, Duration refreshTtl) {}

    /** Accepted Google OAuth client IDs (the {@code aud} claim of the Google ID token). */
    public record Google(List<String> clientIds) {}

    /** Accepted Apple audiences (app bundle ID; Expo Go's host.exp.Exponent in dev). */
    public record Apple(List<String> clientIds) {}

    public record Cors(List<String> allowedOrigins) {}
}
