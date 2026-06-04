package com.kev.backend.auth;

import static org.assertj.core.api.Assertions.assertThat;

import com.kev.backend.support.JwtTestSupport;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;

class JwtServiceTest {

    private JwtService jwtService;
    private JwtDecoder decoder;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService(JwtTestSupport.encoder(), JwtTestSupport.props());
        decoder = JwtTestSupport.decoder();
    }

    @Test
    void accessTokenCarriesSubjectAndClaims() {
        User user = JwtTestSupport.user("rebecca@example.com");
        Jwt decoded = decoder.decode(jwtService.issueAccessToken(user));
        assertThat(decoded.getSubject()).isEqualTo(user.getId().toString());
        assertThat(decoded.getClaimAsString("email")).isEqualTo("rebecca@example.com");
        assertThat(decoded.getClaimAsString("type")).isEqualTo("ACCESS");
        assertThat(decoded.getClaimAsString("role")).isEqualTo("USER");
    }

    @Test
    void refreshTokenIsTypedRefresh() {
        User user = JwtTestSupport.user("a@b.com");
        Jwt decoded = decoder.decode(jwtService.issueRefreshToken(user));
        assertThat(decoded.getClaimAsString("type")).isEqualTo("REFRESH");
    }
}
