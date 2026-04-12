package com.devsu.banking.gateway.config;

import static org.assertj.core.api.Assertions.assertThat;

import com.devsu.banking.gateway.config.FeatureFlagProperties.FeatureFlag;
import java.util.Map;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class FeatureFlagPropertiesTest {

    @Test
    @DisplayName("Should have empty flags and summary paths by default")
    void defaults_areEmpty() {
        FeatureFlagProperties properties = new FeatureFlagProperties();

        assertThat(properties.getFlags()).isEmpty();
        assertThat(properties.getSummaryPaths()).isEmpty();
    }

    @Test
    @DisplayName("Should store and retrieve feature flags correctly")
    void setAndGetFlags_worksCorrectly() {
        FeatureFlagProperties properties = new FeatureFlagProperties();

        FeatureFlag flag = new FeatureFlag();
        flag.setEnabled(false);
        flag.setDescription("Test feature");
        flag.setPathPattern("/api/test/**");

        properties.setFlags(Map.of("test", flag));

        assertThat(properties.getFlags()).hasSize(1);
        assertThat(properties.getFlags().get("test").isEnabled()).isFalse();
        assertThat(properties.getFlags().get("test").getDescription()).isEqualTo("Test feature");
        assertThat(properties.getFlags().get("test").getPathPattern()).isEqualTo("/api/test/**");
    }

    @Test
    @DisplayName("FeatureFlag should have sensible defaults")
    void featureFlag_defaults() {
        FeatureFlag flag = new FeatureFlag();

        assertThat(flag.isEnabled()).isTrue();
        assertThat(flag.getDescription()).isEmpty();
        assertThat(flag.getPathPattern()).isEmpty();
    }
}
