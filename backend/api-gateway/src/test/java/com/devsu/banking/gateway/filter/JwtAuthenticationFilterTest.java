package com.devsu.banking.gateway.filter;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.devsu.banking.gateway.config.GatewaySecurityProperties;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.List;
import javax.crypto.SecretKey;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.mock.http.server.reactive.MockServerHttpRequest;
import org.springframework.mock.web.server.MockServerWebExchange;
import reactor.core.publisher.Mono;

class JwtAuthenticationFilterTest {

    private static final String SECRET =
            "test-secret-key-for-unit-tests-must-be-at-least-256-bits-long-enough";

    private JwtAuthenticationFilter filter;
    private GatewayFilterChain chain;

    @BeforeEach
    void setUp() {
        SecretKey secretKey = Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8));
        GatewaySecurityProperties securityProperties = new GatewaySecurityProperties();
        securityProperties.setOpenPaths(List.of("/auth/**", "/actuator/**"));
        filter = new JwtAuthenticationFilter(secretKey, securityProperties, new ObjectMapper());
        chain = mock(GatewayFilterChain.class);
        when(chain.filter(any())).thenReturn(Mono.empty());
    }

    @Test
    @DisplayName("Should pass through open paths without authentication")
    void filter_openPath_passesThrough() {
        MockServerWebExchange exchange =
                MockServerWebExchange.from(MockServerHttpRequest.get("/auth/login").build());

        filter.filter(exchange, chain).block();

        assertThat(exchange.getResponse().getStatusCode()).isNull();
    }

    @Test
    @DisplayName("Should pass through actuator paths without authentication")
    void filter_actuatorPath_passesThrough() {
        MockServerWebExchange exchange =
                MockServerWebExchange.from(MockServerHttpRequest.get("/actuator/health").build());

        filter.filter(exchange, chain).block();

        assertThat(exchange.getResponse().getStatusCode()).isNull();
    }

    @Test
    @DisplayName("Should return 401 when Authorization header is missing")
    void filter_missingAuthHeader_returns401() {
        MockServerWebExchange exchange =
                MockServerWebExchange.from(MockServerHttpRequest.get("/api/clientes").build());

        filter.filter(exchange, chain).block();

        assertThat(exchange.getResponse().getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    @Test
    @DisplayName("Should return 401 when Authorization header is not Bearer")
    void filter_invalidAuthScheme_returns401() {
        MockServerWebExchange exchange =
                MockServerWebExchange.from(
                        MockServerHttpRequest.get("/api/clientes")
                                .header(HttpHeaders.AUTHORIZATION, "Basic dXNlcjpwYXNz")
                                .build());

        filter.filter(exchange, chain).block();

        assertThat(exchange.getResponse().getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    @Test
    @DisplayName("Should return 401 when JWT token is invalid")
    void filter_invalidToken_returns401() {
        MockServerWebExchange exchange =
                MockServerWebExchange.from(
                        MockServerHttpRequest.get("/api/clientes")
                                .header(HttpHeaders.AUTHORIZATION, "Bearer invalid.jwt.token")
                                .build());

        filter.filter(exchange, chain).block();

        assertThat(exchange.getResponse().getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    @Test
    @DisplayName("Should forward request with auth headers when JWT is valid")
    void filter_validToken_forwardsWithHeaders() {
        String token = generateValidToken("testuser", "USER");

        MockServerWebExchange exchange =
                MockServerWebExchange.from(
                        MockServerHttpRequest.get("/api/clientes")
                                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                                .build());

        filter.filter(exchange, chain).block();

        assertThat(exchange.getResponse().getStatusCode()).isNull();
    }

    @Test
    @DisplayName("Should parse token claims correctly")
    void parseToken_validToken_returnsClaims() {
        String token = generateValidToken("admin", "ADMIN");

        Claims claims = filter.parseToken(token);

        assertThat(claims.getSubject()).isEqualTo("admin");
        assertThat(claims.get("role", String.class)).isEqualTo("ADMIN");
    }

    @Test
    @DisplayName("Should have order -2 (before FeatureFlagFilter)")
    void getOrder_returnsMinus2() {
        int order = JwtAuthenticationFilter.class.getAnnotation(Order.class).value();
        assertThat(order).isEqualTo(-2);
    }

    private String generateValidToken(String username, String role) {
        SecretKey key = Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8));
        return Jwts.builder()
                .subject(username)
                .claim("role", role)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 3600000))
                .signWith(key)
                .compact();
    }
}
