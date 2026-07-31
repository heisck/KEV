package com.kev.backend.verification;

import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.nio.FloatBuffer;

/**
 * Codec and similarity math for face embeddings.
 *
 * <p>Embeddings are stored as little-endian float32 rather than a float8 array or JSON:
 * a 512-d vector is 2 KB, so a 500-student roster is ~1 MB and matching is a linear scan
 * over primitives with no boxing.
 *
 * <p>Vectors arrive L2-normalized from ArcFace, so cosine similarity is a plain dot
 * product — but {@link #cosine} does not assume that, since a truncated or corrupted
 * row would otherwise score arbitrarily high instead of failing loudly.
 */
public final class FaceEmbeddings {

    private FaceEmbeddings() {}

    public static byte[] toBytes(double[] vector) {
        ByteBuffer buffer = ByteBuffer.allocate(vector.length * Float.BYTES).order(ByteOrder.LITTLE_ENDIAN);
        for (double value : vector) {
            buffer.putFloat((float) value);
        }
        return buffer.array();
    }

    public static float[] toVector(byte[] bytes) {
        FloatBuffer floats =
                ByteBuffer.wrap(bytes).order(ByteOrder.LITTLE_ENDIAN).asFloatBuffer();
        float[] vector = new float[floats.remaining()];
        floats.get(vector);
        return vector;
    }

    public static float[] toVector(double[] values) {
        float[] vector = new float[values.length];
        for (int i = 0; i < values.length; i++) {
            vector[i] = (float) values[i];
        }
        return vector;
    }

    /**
     * Cosine similarity in [-1, 1]. Returns 0 for degenerate input — mismatched lengths,
     * empty or zero-magnitude vectors, or a corrupted row containing NaN/infinity.
     *
     * <p>Never returns NaN, and callers depend on that. A NaN score loses every {@code >}
     * comparison, so a roster of corrupt rows would leave the running best unset and NPE
     * on the winner; NaN also serializes as bare {@code NaN}, which is not valid JSON and
     * fails the client's schema parse, replacing an actionable message with a generic
     * error. Degenerate references must lose the comparison, not poison it.
     */
    public static double cosine(float[] a, float[] b) {
        if (a.length != b.length || a.length == 0) {
            return 0.0;
        }
        double dot = 0.0;
        double normA = 0.0;
        double normB = 0.0;
        for (int i = 0; i < a.length; i++) {
            dot += (double) a[i] * b[i];
            normA += (double) a[i] * a[i];
            normB += (double) b[i] * b[i];
        }
        double denominator = Math.sqrt(normA) * Math.sqrt(normB);
        if (denominator == 0.0 || !Double.isFinite(denominator) || !Double.isFinite(dot)) {
            return 0.0;
        }
        double similarity = dot / denominator;
        return Double.isFinite(similarity) ? similarity : 0.0;
    }
}
