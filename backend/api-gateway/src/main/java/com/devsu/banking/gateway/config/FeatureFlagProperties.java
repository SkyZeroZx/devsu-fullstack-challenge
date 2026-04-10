package com.devsu.banking.gateway.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Data
@Component
@ConfigurationProperties(prefix = "features")
public class FeatureFlagProperties {

    private Map<String, FeatureFlag> flags = new HashMap<>();

    @Data
    public static class FeatureFlag {
        private boolean enabled = true;
        private String description = "";
        private String pathPattern = "";
    }
}
