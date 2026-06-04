package com.kev.backend.config;

import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Configuration;

/**
 * Enables Spring's annotation-driven caching. The cache manager is auto-configured
 * from {@code spring.cache.type=redis} against Upstash (TLS) in non-test profiles.
 */
@Configuration
@EnableCaching
public class CacheConfig {}
