package com.kev.backend.verification;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.kev.backend.directory.DirectoryStudent;
import com.kev.backend.directory.DirectoryStudentRepository;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class RosterEmbeddingCacheTest {

    @Mock
    DirectoryStudentRepository students;

    /** A 500-student roster is ~1 MB from Neon; re-reading it per scan is the real cost. */
    @Test
    void readsTheRosterOnceAndServesLaterScansFromMemory() {
        RosterEmbeddingCache cache = new RosterEmbeddingCache(students);
        when(students.findEmbeddedInIndexRange("100", "599")).thenReturn(List.of(student("100"), student("101")));

        List<RosterEmbeddingCache.Candidate> first = cache.candidates("100", "599");
        List<RosterEmbeddingCache.Candidate> second = cache.candidates("100", "599");

        assertThat(first).hasSize(2);
        assertThat(second)
                .extracting(RosterEmbeddingCache.Candidate::indexNumber)
                .containsExactly("100", "101");
        verify(students, times(1)).findEmbeddedInIndexRange("100", "599");
    }

    @Test
    void decodesStoredBytesIntoUsableVectors() {
        RosterEmbeddingCache cache = new RosterEmbeddingCache(students);
        when(students.findEmbeddedInIndexRange("100", "599")).thenReturn(List.of(student("100")));

        float[] embedding = cache.candidates("100", "599").get(0).embedding();

        assertThat(embedding).containsExactly(0.5f, 0.5f, 0.5f, 0.5f);
    }

    /** Newly embedded students must become scannable without waiting for the TTL. */
    @Test
    void rereadsAfterIngestInvalidatesTheRange() {
        RosterEmbeddingCache cache = new RosterEmbeddingCache(students);
        when(students.findEmbeddedInIndexRange("100", "599"))
                .thenReturn(List.of(student("100")))
                .thenReturn(List.of(student("100"), student("101")));

        assertThat(cache.candidates("100", "599")).hasSize(1);
        cache.invalidate("100", "599");

        assertThat(cache.candidates("100", "599")).hasSize(2);
        verify(students, times(2)).findEmbeddedInIndexRange("100", "599");
    }

    @Test
    void keepsRangesApart() {
        RosterEmbeddingCache cache = new RosterEmbeddingCache(students);
        when(students.findEmbeddedInIndexRange("100", "599")).thenReturn(List.of(student("100")));
        when(students.findEmbeddedInIndexRange("600", "999")).thenReturn(List.of(student("600"), student("601")));

        assertThat(cache.candidates("100", "599")).hasSize(1);
        assertThat(cache.candidates("600", "999")).hasSize(2);
    }

    private static DirectoryStudent student(String indexNumber) {
        DirectoryStudent student = new DirectoryStudent();
        student.setIndexNumber(indexNumber);
        student.setFaceEmbedding(FaceEmbeddings.toBytes(new double[] {0.5, 0.5, 0.5, 0.5}));
        return student;
    }
}
