package com.kev.backend.support;

import static java.nio.charset.StandardCharsets.UTF_8;

import com.kev.backend.auth.Role;
import com.kev.backend.auth.User;
import com.kev.backend.config.AppProperties;
import com.nimbusds.jose.jwk.source.ImmutableSecret;
import java.time.Duration;
import java.util.List;
import java.util.UUID;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;

/** Shared builders for unit-testing the JWT layer without a Spring context. */
public final class JwtTestSupport {

    public static final String SECRET = "test-secret-test-secret-test-secret-32bytes-minimum!!";

    private JwtTestSupport() {}

    public static SecretKey key() {
        return new SecretKeySpec(SECRET.getBytes(UTF_8), "HmacSHA256");
    }

    public static JwtEncoder encoder() {
        return new NimbusJwtEncoder(new ImmutableSecret<>(key()));
    }

    public static JwtDecoder decoder() {
        return NimbusJwtDecoder.withSecretKey(key())
                .macAlgorithm(MacAlgorithm.HS256)
                .build();
    }

    public static AppProperties props() {
        return new AppProperties(
                new AppProperties.Auth(
                        new AppProperties.Jwt(SECRET, "kev-test", Duration.ofMinutes(15), Duration.ofDays(30)),
                        new AppProperties.Google(List.of("test-client")),
                        new AppProperties.Apple(List.of("com.kev.app"))),
                new AppProperties.Cors(List.of("http://localhost")));
    }

    public static User user(String email) {
        User u = new User();
        u.setId(UUID.randomUUID());
        u.setEmail(email);
        u.setRole(Role.USER);
        return u;
    }
}
