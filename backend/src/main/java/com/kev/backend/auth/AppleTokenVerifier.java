package com.kev.backend.auth;

import com.kev.backend.common.ApiException;
import com.kev.backend.config.AppProperties;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtClaimValidator;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.stereotype.Component;

/**
 * Verifies an Apple identity token against Apple's JWKS plus issuer and audience
 * (our accepted bundle IDs). Mirrors {@link GoogleTokenVerifier}.
 */
@Component
public class AppleTokenVerifier {

    private static final String APPLE_JWKS = "https://appleid.apple.com/auth/keys";
    private static final String APPLE_ISSUER = "https://appleid.apple.com";

    private final NimbusJwtDecoder decoder;

    public AppleTokenVerifier(AppProperties props) {
        NimbusJwtDecoder nimbus = NimbusJwtDecoder.withJwkSetUri(APPLE_JWKS).build();
        OAuth2TokenValidator<Jwt> issuer = new JwtClaimValidator<String>("iss", APPLE_ISSUER::equals);
        OAuth2TokenValidator<Jwt> audience = jwt -> {
            List<String> allowed = props.auth().apple().clientIds();
            boolean ok = jwt.getAudience() != null && jwt.getAudience().stream().anyMatch(allowed::contains);
            return ok
                    ? OAuth2TokenValidatorResult.success()
                    : OAuth2TokenValidatorResult.failure(
                            new OAuth2Error("invalid_token", "Audience not allowed", null));
        };
        nimbus.setJwtValidator(new DelegatingOAuth2TokenValidator<>(JwtValidators.createDefault(), issuer, audience));
        this.decoder = nimbus;
    }

    public AppleUser verify(String identityToken) {
        try {
            Jwt jwt = decoder.decode(identityToken);
            return new AppleUser(jwt.getSubject(), jwt.getClaimAsString("email"));
        } catch (JwtException e) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid Apple identity token", e);
        }
    }

    /** Apple tokens carry no display name — the client sends it separately on first sign-in. */
    public record AppleUser(String sub, String email) {}
}
