package com.kev.backend.common;

import java.util.Map;
import org.springframework.http.HttpStatus;

/** Application exception carrying an HTTP status, rendered as RFC 7807 ProblemDetail. */
public class ApiException extends RuntimeException {

    private final HttpStatus status;
    private final transient Map<String, Object> properties;

    public ApiException(HttpStatus status, String message) {
        this(status, message, Map.of());
    }

    /** Extension properties are copied onto the ProblemDetail (e.g. plan-limit upgrade hints). */
    public ApiException(HttpStatus status, String message, Map<String, Object> properties) {
        super(message);
        this.status = status;
        this.properties = properties;
    }

    public HttpStatus getStatus() {
        return status;
    }

    public Map<String, Object> getProperties() {
        return properties;
    }
}
