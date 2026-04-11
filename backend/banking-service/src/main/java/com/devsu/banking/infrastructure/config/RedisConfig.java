package com.devsu.banking.infrastructure.config;

import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.jsontype.BasicPolymorphicTypeValidator;
import com.fasterxml.jackson.databind.jsontype.PolymorphicTypeValidator;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.interceptor.CacheErrorHandler;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.time.Duration;
import java.util.Map;

 
@Configuration
@EnableCaching
@EnableConfigurationProperties(CacheTtlProperties.class)
public class RedisConfig {

    @Bean
    public RedisCacheManager cacheManager(RedisConnectionFactory connectionFactory,
                                          CacheTtlProperties ttl) {

        RedisCacheConfiguration base = buildBaseConfig(ttl.getList());

        Map<String, RedisCacheConfiguration> perCacheConfig = Map.of(
                CacheNames.CLIENTS,           base.entryTtl(ttl.getClients()),
                CacheNames.CLIENTS_LIST,      base.entryTtl(ttl.getList()),
                CacheNames.ACCOUNTS,          base.entryTtl(ttl.getAccounts()),
                CacheNames.ACCOUNTS_LIST,     base.entryTtl(ttl.getList()),
                CacheNames.TRANSACTIONS,      base.entryTtl(ttl.getTransactions()),
                CacheNames.TRANSACTIONS_LIST, base.entryTtl(ttl.getList())
        );

        return RedisCacheManager.builder(connectionFactory)
                .cacheDefaults(base)
                .withInitialCacheConfigurations(perCacheConfig)
                .build();
    }

    @Bean
    public CacheErrorHandler cacheErrorHandler() {
        return new LoggingCacheErrorHandler();
    }

 
    private RedisCacheConfiguration buildBaseConfig(Duration defaultTtl) {
        return RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(defaultTtl)
                .serializeKeysWith(
                        RedisSerializationContext.SerializationPair.fromSerializer(new StringRedisSerializer()))
                .serializeValuesWith(
                        RedisSerializationContext.SerializationPair.fromSerializer(cacheSerializer()))
                .disableCachingNullValues();
    }

    /**
     * JSON serializer with scoped type validation.
     * Allows our DTOs, Spring Data domain objects, and JDK types while rejecting
     * untrusted classes – mitigates Jackson deserialization gadget attacks on the
     * internal cache layer.
     */
    private GenericJackson2JsonRedisSerializer cacheSerializer() {
        PolymorphicTypeValidator ptv = BasicPolymorphicTypeValidator.builder()
                .allowIfSubType("com.devsu.banking.")
                .allowIfSubType("org.springframework.data.domain.")
                .allowIfSubType("java.")
                .build();

        ObjectMapper mapper = new ObjectMapper()
                .registerModule(new JavaTimeModule())
                .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS)
                .activateDefaultTyping(ptv, ObjectMapper.DefaultTyping.NON_FINAL, JsonTypeInfo.As.PROPERTY);

        return new GenericJackson2JsonRedisSerializer(mapper);
    }
}
