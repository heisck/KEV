package com.kev.backend.directory;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.Setter;

/** Row in the simulated university directory (UITS mock). */
@Entity
@Table(name = "directory_students")
@Getter
@Setter
public class DirectoryStudent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "index_number", nullable = false, unique = true)
    private String indexNumber;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(nullable = false)
    private String programme;

    /** smallint in the schema (100..700). */
    @Column(nullable = false)
    private short level;

    @Column(name = "photo_url", nullable = false)
    private String photoUrl;

    @Column(nullable = false)
    private boolean enrolled = true;

    @Enumerated(EnumType.STRING)
    @Column(name = "fees_status", nullable = false)
    private FeesStatus feesStatus;

    /** Enrolled courses (via student_courses). LAZY — fetch-joined when needed to avoid N+1. */
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "student_courses",
            joinColumns = @JoinColumn(name = "student_id"),
            inverseJoinColumns = @JoinColumn(name = "course_id"))
    @OrderBy("code ASC")
    private List<Course> courses = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    @PreUpdate
    void onUpdate() {
        this.updatedAt = Instant.now();
    }
}
