package com.devsu.banking.infrastructure.config;

import java.time.Duration;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@Setter
@ConfigurationProperties(prefix = "cache.ttl")
public class CacheTtlProperties {

    private Duration clients = Duration.ofMinutes(10);

    private Duration accounts = Duration.ofMinutes(10);

    private Duration transactions = Duration.ofMinutes(5);

    private Duration list = Duration.ofMinutes(2);
}
