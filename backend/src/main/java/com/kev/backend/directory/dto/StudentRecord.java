package com.kev.backend.directory.dto;

import com.kev.backend.directory.DirectoryStudent;
import com.kev.backend.directory.FeesStatus;
import java.io.Serializable;

/**
 * Student identity + eligibility as reported by the university directory.
 * Serializable because directory lookups are cached in Redis (JDK serializer).
 */
public record StudentRecord(
        Long id,
        String indexNumber,
        String fullName,
        String programme,
        int level,
        String photoUrl,
        boolean enrolled,
        FeesStatus feesStatus,
        boolean eligible)
        implements Serializable {

    public static StudentRecord from(DirectoryStudent s) {
        boolean eligible = s.isEnrolled() && s.getFeesStatus() != FeesStatus.OWING;
        return new StudentRecord(
                s.getId(),
                s.getIndexNumber(),
                s.getFullName(),
                s.getProgramme(),
                s.getLevel(),
                s.getPhotoUrl(),
                s.isEnrolled(),
                s.getFeesStatus(),
                eligible);
    }
}
