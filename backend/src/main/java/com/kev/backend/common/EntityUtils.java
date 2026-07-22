package com.kev.backend.common;

import java.util.Optional;
import org.springframework.http.HttpStatus;

/**
 * Common utilities for entity retrieval and standard ApiException throwing.
 */
public final class EntityUtils {

    private EntityUtils() {}

    /**
     * Unwraps an {@link Optional} or throws an {@link ApiException} with 404 NOT_FOUND.
     */
    public static <T> T requireNonNull(Optional<T> optional, String notFoundMessage) {
        return requireNonNull(optional, HttpStatus.NOT_FOUND, notFoundMessage);
    }

    /**
     * Unwraps an {@link Optional} or throws an {@link ApiException} with the specified HTTP status.
     */
    public static <T> T requireNonNull(Optional<T> optional, HttpStatus status, String message) {
        return optional.orElseThrow(() -> new ApiException(status, message));
    }
}
