package com.kev.backend.auth;

import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.kev.backend.common.ApiException;
import com.kev.backend.support.JwtTestSupport;
import org.junit.jupiter.api.Test;

class GoogleTokenVerifierTest {

    private final GoogleTokenVerifier verifier = new GoogleTokenVerifier(JwtTestSupport.props());

    @Test
    void rejectsMalformedToken() {
        // A non-JWT string fails parsing before any network/JWKS lookup.
        assertThatThrownBy(() -> verifier.verify("not-a-jwt"))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("Invalid Google ID token");
    }
}
