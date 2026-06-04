package com.kev.backend;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIf;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;

/**
 * Full-context smoke test against real Postgres + Redis (Testcontainers).
 * Skipped automatically when Docker is unavailable; runs in CI.
 */
@SpringBootTest
@Import(TestcontainersConfiguration.class)
@EnabledIf("com.kev.backend.support.DockerAvailable#check")
class BackendApplicationTests {

    @Test
    void contextLoads() {}
}
