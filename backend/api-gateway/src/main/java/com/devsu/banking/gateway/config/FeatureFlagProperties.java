package com.devsu.banking.gateway.config;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "features")
public class FeatureFlagProperties {

    private Map<String, FeatureFlag> flags = new HashMap<>();
    private List<String> summaryPaths = new ArrayList<>();

    @Data
    public static class FeatureFlag {
        private boolean enabled = true;
        private String description = "";
        private String pathPattern = "";
    }
}
