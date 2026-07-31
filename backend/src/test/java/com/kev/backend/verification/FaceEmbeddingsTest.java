package com.kev.backend.verification;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.within;

import org.junit.jupiter.api.Test;

class FaceEmbeddingsTest {

    @Test
    void roundTripsThroughByteStorage() {
        double[] original = {0.1, -0.25, 0.75, 0.0, -1.0};

        float[] restored = FaceEmbeddings.toVector(FaceEmbeddings.toBytes(original));

        assertThat(restored).hasSize(5);
        for (int i = 0; i < original.length; i++) {
            assertThat((double) restored[i]).isCloseTo(original[i], within(1e-6));
        }
    }

    @Test
    void identicalVectorsScoreOne() {
        float[] vector = {0.6f, 0.8f, 0.0f};

        assertThat(FaceEmbeddings.cosine(vector, vector)).isCloseTo(1.0, within(1e-9));
    }

    @Test
    void orthogonalVectorsScoreZero() {
        assertThat(FaceEmbeddings.cosine(new float[] {1f, 0f}, new float[] {0f, 1f}))
                .isCloseTo(0.0, within(1e-9));
    }

    @Test
    void opposedVectorsScoreNegativeOne() {
        assertThat(FaceEmbeddings.cosine(new float[] {1f, 0f}, new float[] {-1f, 0f}))
                .isCloseTo(-1.0, within(1e-9));
    }

    @Test
    void magnitudeDoesNotAffectSimilarity() {
        double unit = FaceEmbeddings.cosine(new float[] {1f, 2f}, new float[] {1f, 2f});
        double scaled = FaceEmbeddings.cosine(new float[] {1f, 2f}, new float[] {10f, 20f});

        assertThat(scaled).isCloseTo(unit, within(1e-6));
    }

    /** A truncated or corrupted stored row must score 0, not compare against a prefix. */
    @Test
    void mismatchedLengthsScoreZero() {
        assertThat(FaceEmbeddings.cosine(new float[] {1f, 0f, 0f}, new float[] {1f, 0f}))
                .isZero();
    }

    @Test
    void zeroMagnitudeVectorScoresZeroRatherThanDividingByZero() {
        assertThat(FaceEmbeddings.cosine(new float[] {0f, 0f}, new float[] {1f, 1f}))
                .isZero();
    }

    @Test
    void emptyVectorsScoreZero() {
        assertThat(FaceEmbeddings.cosine(new float[] {}, new float[] {})).isZero();
    }

    /**
     * A corrupt stored row must lose the comparison, not poison it. NaN loses every
     * {@code >} test, which would leave the running best unset and NPE on the winner,
     * and it serializes as bare NaN — invalid JSON that fails the client schema parse.
     */
    @Test
    void corruptedVectorScoresZeroRatherThanNaN() {
        float[] probe = {1f, 0f, 0f};

        assertThat(FaceEmbeddings.cosine(probe, new float[] {Float.NaN, 0f, 0f}))
                .isNotNaN()
                .isZero();
        assertThat(FaceEmbeddings.cosine(probe, new float[] {Float.POSITIVE_INFINITY, 0f, 0f}))
                .isNotNaN()
                .isZero();
        assertThat(FaceEmbeddings.cosine(new float[] {Float.NaN, Float.NaN, Float.NaN}, probe))
                .isNotNaN()
                .isZero();
    }

    /** The identification loop relies on a real reference always outscoring a corrupt one. */
    @Test
    void validReferenceOutscoresCorruptedOne() {
        float[] probe = {1f, 0f};
        double valid = FaceEmbeddings.cosine(probe, new float[] {1f, 0f});
        double corrupt = FaceEmbeddings.cosine(probe, new float[] {Float.NaN, Float.NaN});

        assertThat(valid).isGreaterThan(corrupt);
    }
}
