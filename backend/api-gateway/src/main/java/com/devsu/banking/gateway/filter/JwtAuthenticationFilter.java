package com.devsu.banking.gateway.filter;

import com.devsu.banking.gateway.config.GatewaySecurityProperties;
import com.devsu.banking.gateway.dto.ErrorResponse;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import javax.crypto.SecretKey;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Order(-2)
@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter implements GlobalFilter {

    private static final String BEARER_PREFIX = "Bearer ";

    private final SecretKey jwtSecretKey;
    private final AntPathMatcher pathMatcher = new AntPathMatcher();
    private final GatewaySecurityProperties securityProperties;
    private final ObjectMapper objectMapper;

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String path = exchange.getRequest().getURI().getPath();

        if (isOpenPath(path) || HttpMethod.OPTIONS.equals(exchange.getRequest().getMethod())) {
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
        return Jwts.parser().verifyWith(jwtSecretKey).build().parseSignedClaims(token).getPayload();
    }

    private boolean isOpenPath(String path) {
        return securityProperties.getOpenPaths().stream()
                .anyMatch(pattern -> pathMatcher.match(pattern, path));
    }

    private Mono<Void> rejectWith(ServerWebExchange exchange, String message) {
        exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
        exchange.getResponse().getHeaders().setContentType(MediaType.APPLICATION_JSON);

        try {
            byte[] body =
                    objectMapper.writeValueAsBytes(
                            new ErrorResponse(
                                    HttpStatus.UNAUTHORIZED.value(), "Unauthorized", message));
            DataBuffer buffer = exchange.getResponse().bufferFactory().wrap(body);
            return exchange.getResponse().writeWith(Mono.just(buffer));
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize error response", e);
            return exchange.getResponse().setComplete();
        }
    }
}
