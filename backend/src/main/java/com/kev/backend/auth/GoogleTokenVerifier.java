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
 * Verifies a Google ID token by validating its signature against Google's JWKS
 * plus the issuer and audience (our accepted client IDs). Dependency-free —
 * reuses Spring Security's Nimbus JWT machinery instead of the Google API client.
 */
@Component
public class GoogleTokenVerifier {

    private static final String GOOGLE_JWKS = "https://www.googleapis.com/oauth2/v3/certs";
    private static final List<String> GOOGLE_ISSUERS = List.of("https://accounts.google.com", "accounts.google.com");

    private final NimbusJwtDecoder decoder;

    public GoogleTokenVerifier(AppProperties props) {
        NimbusJwtDecoder nimbus = NimbusJwtDecoder.withJwkSetUri(GOOGLE_JWKS).build();
        OAuth2TokenValidator<Jwt> issuer = new JwtClaimValidator<String>("iss", GOOGLE_ISSUERS::contains);
        OAuth2TokenValidator<Jwt> audience = jwt -> {
            List<String> allowed = props.auth().google().clientIds();
            boolean ok = jwt.getAudience() != null && jwt.getAudience().stream().anyMatch(allowed::contains);
            return ok
                    ? OAuth2TokenValidatorResult.success()
                    : OAuth2TokenValidatorResult.failure(
                            new OAuth2Error("invalid_token", "Audience not allowed", null));
        };
        nimbus.setJwtValidator(new DelegatingOAuth2TokenValidator<>(JwtValidators.createDefault(), issuer, audience));
        this.decoder = nimbus;
    }

    public GoogleUser verify(String idToken) {
        try {
            Jwt jwt = decoder.decode(idToken);
            Boolean emailVerified = jwt.getClaim("email_verified");
            if (Boolean.FALSE.equals(emailVerified)) {
                throw new ApiException(HttpStatus.UNAUTHORIZED, "Google email not verified");
            }
            return new GoogleUser(
                    jwt.getSubject(),
                    jwt.getClaimAsString("email"),
                    jwt.getClaimAsString("name"),
                    jwt.getClaimAsString("picture"));
        } catch (JwtException e) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid Google ID token");
        }
    }

    public record GoogleUser(String sub, String email, String name, String pictureUrl) {}
}
