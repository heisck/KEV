package com.kev.backend.admin;

import com.kev.backend.auth.Plan;
import com.kev.backend.auth.Role;
import com.kev.backend.auth.User;
import com.kev.backend.auth.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Initializes the root Admin user from environment variables (ADMIN_EMAIL, ADMIN_PASSWORD)
 * on Spring Boot startup if no account exists for ADMIN_EMAIL yet.
 */
@Component
public class AdminInitializer implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminInitializer.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final String adminEmail;
    private final String adminPassword;

    public AdminInitializer(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            @Value("${ADMIN_EMAIL:admin@kev.edu}") String adminEmail,
            @Value("${ADMIN_PASSWORD:AdminPassword123!}") String adminPassword) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.adminEmail = adminEmail;
        this.adminPassword = adminPassword;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (adminEmail == null || adminEmail.isBlank() || adminPassword == null || adminPassword.isBlank()) {
            log.info("No ADMIN_EMAIL / ADMIN_PASSWORD set; skipping root admin initialization.");
            return;
        }

        userRepository
                .findByEmail(adminEmail)
                .ifPresentOrElse(existing -> log.info("Root Admin user present in DB: {}", adminEmail), () -> {
                    User admin = new User();
                    admin.setEmail(adminEmail);
                    admin.setDisplayName("Kwame Mensah (Admin)");
                    admin.setRole(Role.ADMIN);
                    admin.setPlan(Plan.PREMIUM);
                    admin.setPasswordHash(passwordEncoder.encode(adminPassword));
                    admin.setActive(true);
                    admin.setStatus("ACTIVE");
                    userRepository.save(admin);
                    log.info("Initialized root Admin account for {}", adminEmail);
                });
    }
}
