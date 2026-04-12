package com.devsu.banking.infrastructure.exception;

import com.devsu.banking.application.dto.ErrorResponseDTO;
import com.devsu.banking.domain.exception.BankingException;
import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Map<String, String> CONSTRAINT_MESSAGES =
            Map.of(
                    "numero_cuenta", "Account number already exists",
                    "identificacion", "Identification already registered",
                    "username", "Username already taken");

    @ExceptionHandler(BankingException.class)
    public ResponseEntity<ErrorResponseDTO> handleBankingException(
            BankingException ex, HttpServletRequest request) {
        log.warn("{}: {}", ex.getClass().getSimpleName(), ex.getMessage());
        return buildErrorResponse(ex.getStatus(), ex.getMessage(), request);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponseDTO> handleValidation(
            MethodArgumentNotValidException ex, HttpServletRequest request) {
        Map<String, String> validationErrors =
                ex.getBindingResult().getFieldErrors().stream()
                        .collect(
                                Collectors.toMap(
                                        FieldError::getField,
                                        FieldError::getDefaultMessage,
                                        (existing, duplicate) -> existing));

        log.warn("Validation failed on {}: {}", request.getRequestURI(), validationErrors);

        ErrorResponseDTO body =
                ErrorResponseDTO.builder()
                        .timestamp(LocalDateTime.now())
                        .status(HttpStatus.BAD_REQUEST.value())
                        .error(HttpStatus.BAD_REQUEST.getReasonPhrase())
                        .message("The provided data is not valid")
                        .path(request.getRequestURI())
                        .validationErrors(validationErrors)
                        .build();

        return ResponseEntity.badRequest().body(body);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorResponseDTO> handleDataIntegrity(
            DataIntegrityViolationException ex, HttpServletRequest request) {
        String rootMsg =
                Optional.ofNullable(ex.getMostSpecificCause())
                        .map(Throwable::getMessage)
                        .map(String::toLowerCase)
                        .orElse("");

        String message =
                CONSTRAINT_MESSAGES.entrySet().stream()
                        .filter(entry -> rootMsg.contains(entry.getKey()))
                        .map(Map.Entry::getValue)
                        .findFirst()
                        .orElse("A record with these values already exists");

        log.warn("Data integrity violation on {}: {}", request.getRequestURI(), rootMsg);
        return buildErrorResponse(HttpStatus.CONFLICT, message, request);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponseDTO> handleGeneral(
            Exception ex, HttpServletRequest request) {
        log.error("Unexpected error on {}: {}", request.getRequestURI(), ex.getMessage(), ex);
        return buildErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, "Internal server error", request);
    }

    private ResponseEntity<ErrorResponseDTO> buildErrorResponse(
            HttpStatus status, String message, HttpServletRequest request) {
        return ResponseEntity.status(status)
                .body(
                        ErrorResponseDTO.builder()
                                .timestamp(LocalDateTime.now())
                                .status(status.value())
                                .error(status.getReasonPhrase())
                                .message(message)
                                .path(request.getRequestURI())
                                .build());
    }
}


