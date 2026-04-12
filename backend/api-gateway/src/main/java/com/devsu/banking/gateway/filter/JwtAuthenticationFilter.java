package com.devsu.banking.gateway.filter;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.util.List;
import javax.crypto.SecretKey;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Order(-2)
@Slf4j
@Component
public class JwtAuthenticationFilter implements GlobalFilter {

    private static final String BEARER_PREFIX = "Bearer ";
    private static final List<String> OPEN_PATHS = List.of("/auth/**", "/actuator/**");

    private final SecretKey secretKey;
    private final AntPathMatcher pathMatcher = new AntPathMatcher();

    public JwtAuthenticationFilter(@Value("${jwt.secret}") String secret) {
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String path = exchange.getRequest().getURI().getPath();

        if (isOpenPath(path)) {
            return chain.filter(exchange);
        }

        String authHeader = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        if (authHeader == null || !authHeader.startsWith(BEARER_PREFIX)) {
            return rejectWith(exchange, "Missing or invalid Authorization header");
        }

        try {
            Claims claims = parseToken(authHeader.substring(BEARER_PREFIX.length()));

            ServerWebExchange mutated =
                    exchange.mutate()
                            .request(
                                    r ->
                                            r.header("X-Auth-Username", claims.getSubject())
                                                    .header(
                                                            "X-Auth-Role",
                                                            claims.get("role", String.class)))
                            .build();

            return chain.filter(mutated);
        } catch (Exception e) {
            log.warn("Invalid JWT token: {}", e.getMessage());
            return rejectWith(exchange, "Invalid or expired token");
        }
    }

    Claims parseToken(String token) {
        return Jwts.parser().verifyWith(secretKey).build().parseSignedClaims(token).getPayload();
    }

    private boolean isOpenPath(String path) {
        return OPEN_PATHS.stream().anyMatch(pattern -> pathMatcher.match(pattern, path));
    }

    private Mono<Void> rejectWith(ServerWebExchange exchange, String message) {
        exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
        exchange.getResponse().getHeaders().setContentType(MediaType.APPLICATION_JSON);

        String body =
                String.format(
                        "{\"status\":401,\"error\":\"Unauthorized\",\"message\":\"%s\"}", message);
        DataBuffer buffer =
                exchange.getResponse().bufferFactory().wrap(body.getBytes(StandardCharsets.UTF_8));
        return exchange.getResponse().writeWith(Mono.just(buffer));
    }
}
