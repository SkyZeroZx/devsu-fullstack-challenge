package com.devsu.banking.gateway.filter;

import com.devsu.banking.gateway.config.FeatureFlagProperties;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class FeatureFlagFilter implements GlobalFilter, Ordered {

    private final FeatureFlagProperties properties;
    private final ObjectMapper objectMapper;
    private final AntPathMatcher pathMatcher = new AntPathMatcher();

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String requestPath = exchange.getRequest().getURI().getPath();

        for (Map.Entry<String, FeatureFlagProperties.FeatureFlag> entry : properties.getFlags().entrySet()) {
            String featureName = entry.getKey();
            FeatureFlagProperties.FeatureFlag flag = entry.getValue();

            if (pathMatcher.match(flag.getPathPattern(), requestPath)) {
                String headerJson = buildFeatureFlagJson(featureName, flag);
                exchange.getResponse().getHeaders().add("X-Feature-Flag", headerJson);

                if (!flag.isEnabled()) {
                    log.warn("Feature '{}' is disabled — blocking request to {}", featureName, requestPath);
                    exchange.getResponse().setStatusCode(HttpStatus.SERVICE_UNAVAILABLE);
                    exchange.getResponse().getHeaders().setContentType(MediaType.APPLICATION_JSON);

                    String body = String.format(
                            "{\"message\":\"Feature '%s' is currently disabled\",\"feature\":\"%s\"}",
                            featureName, featureName);
                    byte[] bytes = body.getBytes(StandardCharsets.UTF_8);
                    DataBuffer buffer = exchange.getResponse().bufferFactory().wrap(bytes);
                    return exchange.getResponse().writeWith(Mono.just(buffer));
                }

                log.debug("Feature '{}' is enabled — forwarding request to {}", featureName, requestPath);
                break;
            }
        }

        return chain.filter(exchange);
    }

    private String buildFeatureFlagJson(String featureName, FeatureFlagProperties.FeatureFlag flag) {
        try {
            Map<String, Object> flagData = Map.of(
                    "feature", featureName,
                    "enabled", flag.isEnabled(),
                    "description", flag.getDescription()
            );
            return objectMapper.writeValueAsString(flagData);
        } catch (JsonProcessingException e) {
            return String.format("{\"feature\":\"%s\",\"enabled\":%s}", featureName, flag.isEnabled());
        }
    }

    @Override
    public int getOrder() {
        return -1;
    }
}
