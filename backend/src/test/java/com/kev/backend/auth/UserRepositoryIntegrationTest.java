package com.kev.backend.auth;

import static org.assertj.core.api.Assertions.assertThat;

import com.kev.backend.TestcontainersConfiguration;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIf;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;
import org.springframework.context.annotation.Import;

/**
 * Repository slice test against a real Postgres (Testcontainers) with Flyway-managed
 * schema. Skipped when Docker is unavailable; runs in CI.
 */
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Import(TestcontainersConfiguration.class)
@EnabledIf("com.kev.backend.support.DockerAvailable#check")
class UserRepositoryIntegrationTest {

    @Autowired
    private UserRepository users;

    @Test
    void savesAndLooksUpUser() {
        User user = new User();
        user.setEmail("rebecca@example.com");
        user.setGoogleSub("google-sub-123");
        user.setRole(Role.USER);
        users.save(user);

        assertThat(users.findByEmail("rebecca@example.com")).isPresent();
        assertThat(users.findByGoogleSub("google-sub-123")).isPresent();
    }
}
