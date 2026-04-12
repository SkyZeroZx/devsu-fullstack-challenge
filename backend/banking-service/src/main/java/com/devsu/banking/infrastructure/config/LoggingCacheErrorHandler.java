package com.devsu.banking.infrastructure.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.Cache;
import org.springframework.cache.interceptor.SimpleCacheErrorHandler;

@Slf4j
class LoggingCacheErrorHandler extends SimpleCacheErrorHandler {

    @Override
    public void handleCacheGetError(RuntimeException ex, Cache cache, Object key) {
        log.warn(
                "Cache GET error [{}::{}] - falling back to datasource: {}",
                cache.getName(),
                key,
                ex.getMessage());
    }

    @Override
    public void handleCachePutError(RuntimeException ex, Cache cache, Object key, Object value) {
        log.warn("Cache PUT error [{}::{}]: {}", cache.getName(), key, ex.getMessage());
    }

    @Override
    public void handleCacheEvictError(RuntimeException ex, Cache cache, Object key) {
        log.warn("Cache EVICT error [{}::{}]: {}", cache.getName(), key, ex.getMessage());
    }

    @Override
    public void handleCacheClearError(RuntimeException ex, Cache cache) {
        log.warn("Cache CLEAR error [{}]: {}", cache.getName(), ex.getMessage());
    }
}
