package com.kev.backend.notification;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class ArkeselSmsService {

    private static final Logger log = LoggerFactory.getLogger(ArkeselSmsService.class);
    private final String apiKey;
    private final String senderId;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient =
            HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5)).build();

    public ArkeselSmsService(
            @Value("${ARKESEL_API_KEY:}") String apiKey,
            @Value("${ARKESEL_SENDER_ID:KEV-EXAM}") String senderId,
            ObjectMapper objectMapper) {
        this.apiKey = apiKey;
        this.senderId = senderId;
        this.objectMapper = objectMapper;
    }

    public void sendSms(String phone, String message) {
        log.info("Sending SMS (Arkesel) to {}: {}", phone, message);
        if (apiKey == null || apiKey.isBlank() || phone == null || phone.isBlank()) {
            log.debug("Arkesel API key or phone not set; skipping live HTTP SMS dispatch.");
            return;
        }
        try {
            Map<String, Object> payload = Map.of(
                    "sender", senderId,
                    "message", message,
                    "recipients", List.of(phone));
            String jsonPayload = objectMapper.writeValueAsString(payload);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://sms.arkesel.com/api/v2/sms/send"))
                    .header("api-key", apiKey)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                    .build();

            httpClient
                    .sendAsync(request, HttpResponse.BodyHandlers.ofString())
                    .thenAccept(response -> {
                        if (response.statusCode() >= 200 && response.statusCode() < 300) {
                            log.info("Arkesel SMS API status: {}", response.statusCode());
                        } else {
                            log.warn(
                                    "Arkesel SMS API returned non-2xx status {}: {}",
                                    response.statusCode(),
                                    response.body());
                        }
                    })
                    .exceptionally(ex -> {
                        log.warn("Arkesel SMS dispatch failed", ex);
                        return null;
                    });
        } catch (Exception ex) {
            log.warn("Exception during Arkesel SMS dispatch", ex);
        }
    }

    public void sendEmail(String email, String subject, String body) {
        log.info("Sending Email to {} [Subject: {}]:\n{}", email, subject, body);
    }
}
