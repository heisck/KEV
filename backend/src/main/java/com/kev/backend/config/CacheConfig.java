package com.kev.backend.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.Cache;
import org.springframework.cache.annotation.CachingConfigurer;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.interceptor.CacheErrorHandler;
import org.springframework.context.annotation.Configuration;

/**
 * Enables Spring's annotation-driven caching. The cache manager is auto-configured
 * from {@code spring.cache.type=redis} against Upstash (TLS) in non-test profiles.
 */
@Configuration
@EnableCaching
public class CacheConfig implements CachingConfigurer {

    private static final Logger log = LoggerFactory.getLogger(CacheConfig.class);

    /**
     * Degrade to the underlying call when the cache is unreachable.
     *
     * <p>Every cached value here is a read-through accelerator over Postgres, never the
     * only copy. Without this, an Upstash outage — or a misconfigured host — propagates out
     * of {@code @Cacheable} and fails the request that triggered it, which on the check-in
     * path means an invigilator watching a matched student refuse to be marked present.
     * Errors are logged rather than silently dropped; the request then reads from the DB.
     */
    @Override
    public CacheErrorHandler errorHandler() {
        return new CacheErrorHandler() {
            @Override
            public void handleCacheGetError(RuntimeException error, Cache cache, Object key) {
                warn("read", cache, error);
            }

            @Override
            public void handleCachePutError(RuntimeException error, Cache cache, Object key, Object value) {
                warn("write", cache, error);
            }

            @Override
            public void handleCacheEvictError(RuntimeException error, Cache cache, Object key) {
                warn("evict", cache, error);
            }

            @Override
            public void handleCacheClearError(RuntimeException error, Cache cache) {
                warn("clear", cache, error);
            }
        };
    }

    /** One line, no stack trace: a cache outage repeats on every request. */
    private static void warn(String operation, Cache cache, RuntimeException error) {
        log.warn(
                "cache {} failed on '{}', falling through to the source: {}",
                operation,
                cache.getName(),
                error.getMessage());
    }
}
