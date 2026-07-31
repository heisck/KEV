package com.kev.backend.ml;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.kev.backend.common.ApiException;
import com.kev.backend.web.CorrelationIdFilter;
import java.time.Duration;
import java.util.List;
import org.slf4j.MDC;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;

/** HTTP client for the KEV ML face service; propagates X-Correlation-Id from the MDC. */
@Component
public class MlClient {

    public record VerifyFaceResponse(double similarity, boolean match, double threshold) {}

    /** One reference photo's embedding, or {@code error} explaining why there is none. */
    // The ML service is snake_case (FastAPI/Pydantic); bind those names explicitly
    // rather than reconfiguring the application-wide Jackson naming strategy.
    public record EmbedItem(
            String url,
            double[] embedding,
            @JsonProperty("det_score") Double detScore,
            @JsonProperty("model_version") String modelVersion,
            String error) {}

    private record EmbedBatchRequest(List<String> urls, int concurrency) {}

    private record EmbedBatchResponse(List<EmbedItem> results) {}

    public record EmbedFaceResponse(double[] embedding, @JsonProperty("det_score") double detScore) {}

    private final RestClient client;

    public MlClient(
            @Value("${kev.ml.base-url:http://localhost:8000}") String baseUrl,
            @Value("${kev.ml.read-timeout-seconds:120}") long readTimeoutSeconds) {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(Duration.ofSeconds(5));
        factory.setReadTimeout(Duration.ofSeconds(readTimeoutSeconds));
        this.client = RestClient.builder()
                .baseUrl(baseUrl)
                .requestFactory(factory)
                .requestInitializer(request -> {
                    String correlationId = MDC.get(CorrelationIdFilter.MDC_KEY);
                    if (correlationId != null) {
                        request.getHeaders().set(CorrelationIdFilter.HEADER, correlationId);
                    }
                })
                .build();
    }

    /**
     * Embed many reference photos by URL in one call. The ML service fans the fetches
     * out concurrently, so this stays a single round trip for a whole roster. Per-URL
     * failures come back as items with a non-null {@code error}.
     */
    public List<EmbedItem> embedFaces(List<String> urls, int concurrency) {
        if (urls.isEmpty()) {
            return List.of();
        }
        try {
            EmbedBatchResponse response = client.post()
                    .uri("/embed-faces")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(new EmbedBatchRequest(urls, concurrency))
                    .retrieve()
                    .body(EmbedBatchResponse.class);
            return response != null && response.results() != null ? response.results() : List.of();
        } catch (ResourceAccessException e) {
            throw new ApiException(HttpStatus.BAD_GATEWAY, "Face embedding service unavailable");
        }
    }

    /** Embed a single captured probe image. This is the only model call on the scan path. */
    public EmbedFaceResponse embedFace(byte[] image, String filename) {
        MultiValueMap<String, Object> form = new LinkedMultiValueMap<>();
        form.add("image", new ByteArrayResource(image) {
            @Override
            public String getFilename() {
                return filename;
            }
        });
        try {
            return client.post()
                    .uri("/embed-face")
                    .contentType(MediaType.MULTIPART_FORM_DATA)
                    .body(form)
                    .retrieve()
                    .body(EmbedFaceResponse.class);
        } catch (ResourceAccessException e) {
            throw new ApiException(HttpStatus.BAD_GATEWAY, "Face verification service unavailable");
        }
    }

    /** Verify a probe image against a reference photo URL. */
    public VerifyFaceResponse verifyFace(byte[] probeImage, String probeFilename, String referenceUrl) {
        MultiValueMap<String, Object> form = new LinkedMultiValueMap<>();
        form.add("probe", new ByteArrayResource(probeImage) {
            @Override
            public String getFilename() {
                return probeFilename;
            }
        });
        form.add("reference_url", referenceUrl);
        try {
            return client.post()
                    .uri("/verify-face")
                    .contentType(MediaType.MULTIPART_FORM_DATA)
                    .body(form)
                    .retrieve()
                    .body(VerifyFaceResponse.class);
        } catch (ResourceAccessException e) {
            throw new ApiException(HttpStatus.BAD_GATEWAY, "Face verification service unavailable");
        }
    }
}
