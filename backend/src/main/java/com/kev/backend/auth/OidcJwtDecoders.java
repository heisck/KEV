package com.kev.backend.auth;

import java.util.List;
import java.util.function.Supplier;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;

/**
 * Shared construction of Nimbus JWT decoders for external OIDC providers (Google, Apple):
 * validate the signature against the provider's JWKS plus the default claims, a provider issuer
 * check, and an audience check against our accepted client IDs.
 */
final class OidcJwtDecoders {

    private OidcJwtDecoders() {}

    static NimbusJwtDecoder forProvider(
            String jwkSetUri, OAuth2TokenValidator<Jwt> issuer, Supplier<List<String>> allowedAudiences) {
        NimbusJwtDecoder decoder = NimbusJwtDecoder.withJwkSetUri(jwkSetUri).build();
        decoder.setJwtValidator(new DelegatingOAuth2TokenValidator<>(
                JwtValidators.createDefault(), issuer, audienceValidator(allowedAudiences)));
        return decoder;
    }

    private static OAuth2TokenValidator<Jwt> audienceValidator(Supplier<List<String>> allowedAudiences) {
        return jwt -> {
            List<String> allowed = allowedAudiences.get();
            boolean ok = jwt.getAudience() != null && jwt.getAudience().stream().anyMatch(allowed::contains);
            return ok
                    ? OAuth2TokenValidatorResult.success()
                    : OAuth2TokenValidatorResult.failure(
                            new OAuth2Error("invalid_token", "Audience not allowed", null));
        };
    }
}
