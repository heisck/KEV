package com.kev.backend.common;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

class ApiExceptionTest {

    @Test
    void preservesCauseWhenProvided() {
        Throwable cause = new IllegalStateException("boom");
        ApiException ex = new ApiException(HttpStatus.BAD_GATEWAY, "Upstream failed", cause);

        assertThat(ex.getCause()).isSameAs(cause);
        assertThat(ex.getStatus()).isEqualTo(HttpStatus.BAD_GATEWAY);
        assertThat(ex.getProperties()).isEmpty();
    }

    @Test
    void hasNoCauseByDefault() {
        ApiException ex = new ApiException(HttpStatus.NOT_FOUND, "Missing");

        assertThat(ex.getCause()).isNull();
    }
}
