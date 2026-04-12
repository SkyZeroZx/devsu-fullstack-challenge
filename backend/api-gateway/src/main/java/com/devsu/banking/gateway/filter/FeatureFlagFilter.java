package com.devsu.banking.gateway.filter;

import com.devsu.banking.gateway.config.FeatureFlagProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Order(-1)
@Component
@RequiredArgsConstructor
public class FeatureFlagFilter implements GlobalFilter {

    private final FeatureFlagProperties properties;
    private final AntPathMatcher pathMatcher = new AntPathMatcher();

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String path = exchange.getRequest().getURI().getPath();

        if (isSummaryPath(path)) {
            properties
                    .getFlags()
                    .forEach(
                            (name, flag) ->
                                    exchange.getResponse()
                                            .getHeaders()
                                            .add(
                                                    "X-Feature-" + name,
                                                    String.valueOf(flag.isEnabled())));
        }

        return chain.filter(exchange);
    }

    private boolean isSummaryPath(String path) {
        return properties.getSummaryPaths().stream()
                .anyMatch(pattern -> pathMatcher.match(pattern, path));
    }
}
