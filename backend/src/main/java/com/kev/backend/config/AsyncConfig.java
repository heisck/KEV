package com.kev.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;

/**
 * Enables {@code @Async}. Without this the annotation is silently inert and the
 * roster ingest would run inline, blocking session creation for the length of a
 * full embedding pass.
 *
 * <p>Virtual threads are on ({@code spring.threads.virtual.enabled}), so Boot's
 * async executor is already backed by them — ingest is dominated by blocking IO
 * against UITS and the ML service, which is exactly what they are for.
 */
@Configuration
@EnableAsync
public class AsyncConfig {}
