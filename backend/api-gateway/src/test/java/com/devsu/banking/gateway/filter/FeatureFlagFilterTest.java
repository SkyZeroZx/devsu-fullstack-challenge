package com.devsu.banking.gateway.filter;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.devsu.banking.gateway.config.FeatureFlagProperties;
import com.devsu.banking.gateway.config.FeatureFlagProperties.FeatureFlag;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.core.annotation.Order;
import org.springframework.mock.http.server.reactive.MockServerHttpRequest;
import org.springframework.mock.web.server.MockServerWebExchange;
import reactor.core.publisher.Mono;

class FeatureFlagFilterTest {

    private FeatureFlagProperties properties;
    private FeatureFlagFilter filter;
    private GatewayFilterChain chain;

    @BeforeEach
    void setUp() {
        properties = new FeatureFlagProperties();
        properties.setSummaryPaths(List.of("/auth/login"));

        Map<String, FeatureFlag> flags = new LinkedHashMap<>();

        FeatureFlag clientsFlag = new FeatureFlag();
        clientsFlag.setEnabled(true);
        clientsFlag.setDescription("Client management");
        clientsFlag.setPathPattern("/api/clientes/**");
        flags.put("clients", clientsFlag);

        FeatureFlag transactionsFlag = new FeatureFlag();
        transactionsFlag.setEnabled(false);
        transactionsFlag.setDescription("Transaction management");
        transactionsFlag.setPathPattern("/api/movimientos/**");
        flags.put("transactions", transactionsFlag);

        properties.setFlags(flags);

        filter = new FeatureFlagFilter(properties);
        chain = mock(GatewayFilterChain.class);
        when(chain.filter(any())).thenReturn(Mono.empty());
    }

    @Test
    @DisplayName("Should add individual X-Feature-* headers on summary paths")
    void filter_summaryPath_addsFeatureHeaders() {
        MockServerWebExchange exchange =
                MockServerWebExchange.from(MockServerHttpRequest.post("/auth/login").build());

        filter.filter(exchange, chain).block();

        assertThat(exchange.getResponse().getHeaders().getFirst("X-Feature-clients"))
                .isEqualTo("true");
        assertThat(exchange.getResponse().getHeaders().getFirst("X-Feature-transactions"))
                .isEqualTo("false");
    }

    @Test
    @DisplayName("Should support multiple configurable summary paths")
    void filter_customSummaryPath_addsFeatureHeaders() {
        properties.setSummaryPaths(List.of("/auth/login", "/custom/status"));

        MockServerWebExchange exchange =
                MockServerWebExchange.from(MockServerHttpRequest.get("/custom/status").build());

        filter.filter(exchange, chain).block();

        assertThat(exchange.getResponse().getHeaders().getFirst("X-Feature-clients"))
                .isEqualTo("true");
        assertThat(exchange.getResponse().getHeaders().getFirst("X-Feature-transactions"))
                .isEqualTo("false");
    }

    @Test
    @DisplayName("Should not add feature headers on non-summary paths")
    void filter_nonSummaryPath_noFeatureHeaders() {
        MockServerWebExchange exchange =
                MockServerWebExchange.from(MockServerHttpRequest.get("/api/clientes").build());

        filter.filter(exchange, chain).block();

        assertThat(exchange.getResponse().getHeaders().getFirst("X-Feature-clients")).isNull();
    }

    @Test
    @DisplayName("Should always forward requests regardless of flag state")
    void filter_disabledFeature_stillForwards() {
        MockServerWebExchange exchange =
                MockServerWebExchange.from(MockServerHttpRequest.get("/api/movimientos").build());

        filter.filter(exchange, chain).block();

        assertThat(exchange.getResponse().getStatusCode()).isNull();
    }

    @Test
    @DisplayName("Should have order -1 (after JwtAuthenticationFilter)")
    void getOrder_returnsMinus1() {
        int order = FeatureFlagFilter.class.getAnnotation(Order.class).value();
        assertThat(order).isEqualTo(-1);
    }
}
