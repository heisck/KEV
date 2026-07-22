package com.kev.backend.common;

import static org.junit.jupiter.api.Assertions.*;

import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

class EntityUtilsTest {

    @Test
    void requireNonNullReturnsValueWhenPresent() {
        Optional<String> value = Optional.of("hello");
        String result = EntityUtils.requireNonNull(value, "Not found");
        assertEquals("hello", result);
    }

    @Test
    void requireNonNullThrowsApiExceptionWhenEmpty() {
        Optional<String> value = Optional.empty();
        ApiException ex = assertThrows(ApiException.class, () -> EntityUtils.requireNonNull(value, "User not found"));

        assertEquals(HttpStatus.NOT_FOUND, ex.getStatus());
        assertEquals("User not found", ex.getMessage());
    }

    @Test
    void requireNonNullWithStatusThrowsCustomStatus() {
        Optional<String> value = Optional.empty();
        ApiException ex = assertThrows(
                ApiException.class, () -> EntityUtils.requireNonNull(value, HttpStatus.FORBIDDEN, "Access denied"));

        assertEquals(HttpStatus.FORBIDDEN, ex.getStatus());
        assertEquals("Access denied", ex.getMessage());
    }
}
