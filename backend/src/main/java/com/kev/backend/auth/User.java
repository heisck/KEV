package com.kev.backend.auth;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;
import lombok.Getter;
import lombok.Setter;

/** Authenticated user (Admin or Lecturer). */
@Entity
@Table(name = "users")
@Getter
@Setter
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "google_sub", unique = true)
    private String googleSub;

    @Column(name = "apple_sub", unique = true)
    private String appleSub;

    @Column(name = "display_name")
    private String displayName;

    @Column(name = "picture_url")
    private String pictureUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role = Role.LECTURER;

    /** BCrypt hash; null for Google/Apple-only accounts. */
    @Column(name = "password_hash")
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Plan plan = Plan.FREE;

    @Column(name = "lecturer_id")
    private String lecturerId;

    @Column(name = "personal_email")
    private String personalEmail;

    @Column(name = "phone")
    private String phone;

    @Column(name = "status")
    private String status = "ACTIVE";

    @Column(name = "is_active")
    private boolean active = true;

    @Column(name = "created_by_admin")
    private UUID createdByAdmin;

    @Column(name = "last_login")
    private Instant lastLogin;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    @PreUpdate
    void onUpdate() {
        this.updatedAt = Instant.now();
    }
}
