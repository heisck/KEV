package com.kev.backend.ml;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.within;

import org.junit.jupiter.api.Test;
import tools.jackson.databind.ObjectMapper;

/**
 * The ML service is FastAPI and speaks snake_case; these records are camelCase. A
 * silent binding failure here would not throw — {@code detScore} would simply arrive
 * as 0, which reads as "every capture is too blurry" and rejects every scan. Pin the
 * mapping with the same Jackson generation Spring's RestClient uses.
 */
class MlClientBindingTest {

    private final ObjectMapper mapper = new ObjectMapper();

    @Test
    void bindsSnakeCaseFieldsOnBatchItem() {
        String json =
                """
                {
                  "url": "https://cdn.example/face.jpg",
                  "embedding": [0.1, 0.2, 0.3],
                  "det_score": 0.87,
                  "model_version": "buffalo_sc",
                  "error": null
                }
                """;

        MlClient.EmbedItem item = mapper.readValue(json, MlClient.EmbedItem.class);

        assertThat(item.url()).isEqualTo("https://cdn.example/face.jpg");
        assertThat(item.embedding()).containsExactly(0.1, 0.2, 0.3);
        assertThat(item.detScore()).isCloseTo(0.87, within(1e-9));
        assertThat(item.modelVersion()).isEqualTo("buffalo_sc");
        assertThat(item.error()).isNull();
    }

    @Test
    void bindsFailedBatchItemWithoutEmbedding() {
        String json =
                """
                {"url": "https://cdn.example/bad.jpg", "error": "No face detected"}
                """;

        MlClient.EmbedItem item = mapper.readValue(json, MlClient.EmbedItem.class);

        assertThat(item.embedding()).isNull();
        assertThat(item.detScore()).isNull();
        assertThat(item.error()).isEqualTo("No face detected");
    }

    @Test
    void bindsSnakeCaseDetScoreOnProbeResponse() {
        String json = """
                {"embedding": [0.5, 0.5], "det_score": 0.93}
                """;

        MlClient.EmbedFaceResponse response = mapper.readValue(json, MlClient.EmbedFaceResponse.class);

        assertThat(response.embedding()).containsExactly(0.5, 0.5);
        assertThat(response.detScore()).isCloseTo(0.93, within(1e-9));
    }
}
