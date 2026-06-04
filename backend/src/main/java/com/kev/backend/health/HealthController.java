package com.kev.backend.health;

import java.time.Instant;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Lightweight public liveness endpoint (separate from Actuator's /actuator/health). */
@RestController
@RequestMapping("/api")
public class HealthController {

    @GetMapping("/health")
    public HealthResponse health() {
        return new HealthResponse("ok", "kev-backend", Instant.now().toString());
    }

    public record HealthResponse(String status, String service, String timestamp) {}
}
