package com.kev.backend.ml;

import com.kev.backend.common.ApiException;
import com.kev.backend.web.CorrelationIdFilter;
import java.time.Duration;
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

    private final RestClient client;

    public MlClient(@Value("${kev.ml.base-url:http://localhost:8000}") String baseUrl) {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(Duration.ofSeconds(5));
        factory.setReadTimeout(Duration.ofSeconds(30));
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
            throw new ApiException(HttpStatus.BAD_GATEWAY, "Face verification service unavailable", e);
        }
    }
}
