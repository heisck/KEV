package com.kev.backend.directory.uits;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.kev.backend.common.ApiException;
import com.kev.backend.directory.DirectoryStudent;
import com.kev.backend.directory.DirectoryStudentRepository;
import com.kev.backend.ml.MlClient;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

@ExtendWith(MockitoExtension.class)
class RosterIngestServiceTest {

    @Mock
    UitsClient uits;

    @Mock
    MlClient ml;

    @Mock
    DirectoryStudentRepository students;

    RosterIngestService service;

    @BeforeEach
    void setUp() {
        service = new RosterIngestService(uits, ml, students, 16, 25);
    }

    @Test
    void reportsProgressFromPreparedToComplete() {
        service.prepare(42L, "100", "599", "session:42");
        assertThat(service.status(42L).progress()).isZero();
        when(uits.fetchRoster("100", "599", "session:42")).thenReturn(List.of());
        when(students.findPendingEmbedding()).thenReturn(List.of());

        service.ingestRangeAsync(42L, "100", "599", "session:42");

        assertThat(service.status(42L).state()).isEqualTo("COMPLETED");
        assertThat(service.status(42L).progress()).isEqualTo(100);
    }

    @Test
    void reportsExternalFailureWithoutThrowingFromAsyncJob() {
        service.prepare(7L, "100", "599", "session:7");
        when(uits.fetchRoster("100", "599", "session:7"))
                .thenThrow(new ApiException(HttpStatus.BAD_GATEWAY, "University system unavailable"));

        service.ingestRangeAsync(7L, "100", "599", "session:7");

        assertThat(service.status(7L).state()).isEqualTo("FAILED");
        assertThat(service.status(7L).message()).isEqualTo("University system unavailable");
    }

    /** A failure mid-run must not rewind the bar the user is watching. */
    @Test
    void neverMovesProgressBackwards() {
        service.prepare(9L, "100", "599", "session:9");
        when(uits.fetchRoster("100", "599", "session:9"))
                .thenReturn(List.of(uitsStudent("100")))
                .thenThrow(new ApiException(HttpStatus.BAD_GATEWAY, "University system unavailable"));
        when(students.findPendingEmbedding()).thenReturn(List.of());

        service.ingestRangeAsync(9L, "100", "599", "session:9");
        assertThat(service.status(9L).progress()).isEqualTo(100);

        service.retry(9L);

        assertThat(service.status(9L).state()).isEqualTo("FAILED");
        assertThat(service.status(9L).progress()).isEqualTo(100);
        assertThat(service.status(9L).synced()).isEqualTo(1);
    }

    /**
     * One call per chunk is what keeps a roster-sized backfill inside the ML read timeout,
     * and what lets rows land in the directory while the rest is still embedding.
     */
    @Test
    void embedsInChunksAndPersistsEachChunkSeparately() {
        service = new RosterIngestService(uits, ml, students, 16, 2);
        when(students.findPendingEmbedding()).thenReturn(List.of(student("100"), student("101"), student("102")));
        when(ml.embedFaces(anyList(), eq(16))).thenAnswer(call -> {
            List<String> urls = call.getArgument(0);
            return urls.stream()
                    .map(url -> new MlClient.EmbedItem(url, new double[] {0.1, 0.2}, 0.9, "v1", null))
                    .toList();
        });

        int embedded = service.embedPending(3L, 3);

        assertThat(embedded).isEqualTo(3);
        verify(ml, times(2)).embedFaces(anyList(), eq(16));
        verify(students, times(2)).saveAll(anyList());
        assertThat(service.status(3L).embedded()).isEqualTo(3);
    }

    @Test
    void countsPhotosThatProduceNoFaceWithoutFailingTheRun() {
        when(students.findPendingEmbedding()).thenReturn(List.of(student("100"), student("101")));
        when(ml.embedFaces(anyList(), eq(16)))
                .thenReturn(List.of(
                        new MlClient.EmbedItem("photo-100", new double[] {0.1, 0.2}, 0.9, "v1", null),
                        new MlClient.EmbedItem("photo-101", null, null, null, "No face detected")));

        assertThat(service.embedPending(4L, 2)).isEqualTo(1);
    }

    private static DirectoryStudent student(String indexNumber) {
        DirectoryStudent student = new DirectoryStudent();
        student.setIndexNumber(indexNumber);
        student.setPhotoUrl("photo-" + indexNumber);
        return student;
    }

    private static UitsClient.UitsStudent uitsStudent(String indexNumber) {
        return new UitsClient.UitsStudent(
                "uits-" + indexNumber,
                "Ama",
                "Mensah",
                indexNumber,
                "s" + indexNumber,
                "nfc",
                null,
                "photo-" + indexNumber);
    }
}
