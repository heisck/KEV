package com.kev.backend.support;

import org.testcontainers.DockerClientFactory;

/**
 * Gate for Testcontainers-based tests. Used with JUnit's {@code @EnabledIf} so that
 * integration tests are skipped (not failed) on machines without Docker, while still
 * running in CI where Docker is available.
 */
public final class DockerAvailable {

    private DockerAvailable() {}

    public static boolean check() {
        try {
            return DockerClientFactory.instance().isDockerAvailable();
        } catch (Throwable t) {
            return false;
        }
    }
}
