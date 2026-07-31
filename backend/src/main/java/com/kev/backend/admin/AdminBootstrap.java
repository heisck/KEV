package com.kev.backend.admin;

import com.kev.backend.auth.Plan;
import com.kev.backend.auth.Role;
import com.kev.backend.auth.User;
import com.kev.backend.auth.UserRepository;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Creates the first administrator from the environment.
 *
 * <p>Every other account is provisioned in-app by an administrator, so the system needs
 * exactly one way in on a fresh database — and it must not be a credential committed to
 * the repo. Creates on first boot only: an existing account is never re-hashed, so a
 * password changed in-app is not silently reverted by a redeploy. To recover a lost
 * password, delete the row and restart with the desired {@code KEV_ADMIN_PASSWORD}.
 */
@Component
public class AdminBootstrap implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminBootstrap.class);
    private static final int MIN_PASSWORD_LENGTH = 12;

    private final UserRepository users;
    private final PasswordEncoder passwordEncoder;
    private final String email;
    private final String password;
    private final String displayName;

    public AdminBootstrap(
            UserRepository users,
            PasswordEncoder passwordEncoder,
            @Value("${KEV_ADMIN_EMAIL:}") String email,
            @Value("${KEV_ADMIN_PASSWORD:}") String password,
            @Value("${KEV_ADMIN_NAME:KEV Administrator}") String displayName) {
        this.users = users;
        this.passwordEncoder = passwordEncoder;
        this.email = email;
        this.password = password;
        this.displayName = displayName;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        String address = email.trim();
        if (address.isEmpty() || password.isEmpty()) {
            warnIfNoAdminExists();
            return;
        }
        if (password.length() < MIN_PASSWORD_LENGTH) {
            throw new IllegalStateException(
                    "KEV_ADMIN_PASSWORD must be at least " + MIN_PASSWORD_LENGTH + " characters");
        }
        if (users.findByEmail(address).isPresent()) {
            log.info("Bootstrap admin {} already exists; leaving its password untouched.", address);
            return;
        }
        User admin = new User();
        admin.setEmail(address);
        admin.setDisplayName(displayName.trim());
        admin.setRole(Role.ADMIN);
        admin.setPlan(Plan.PREMIUM);
        admin.setPasswordHash(passwordEncoder.encode(password));
        admin.setStatus("ACTIVE");
        admin.setActive(true);
        users.save(admin);
        log.info("Created bootstrap administrator {} from KEV_ADMIN_* environment.", address);
    }

    /** A deployment with no administrator cannot provision lecturers — say so loudly. */
    private void warnIfNoAdminExists() {
        if (users.findAllByRoleInAndActiveTrue(List.of(Role.ADMIN)).isEmpty()) {
            log.error("No active administrator exists and KEV_ADMIN_EMAIL/KEV_ADMIN_PASSWORD are unset — "
                    + "nobody can sign in to provision accounts. Set both and restart.");
        }
    }
}
