package com.kev.backend.common;

import org.springframework.http.HttpStatus;

/** Application exception carrying an HTTP status, rendered as RFC 7807 ProblemDetail. */
public class ApiException extends RuntimeException {

    private final HttpStatus status;

    public ApiException(HttpStatus status, String message) {
        super(message);
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }
}
