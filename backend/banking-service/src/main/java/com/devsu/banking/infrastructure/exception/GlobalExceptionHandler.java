package com.devsu.banking.infrastructure.exception;

import com.devsu.banking.application.dto.ErrorResponseDTO;
import com.devsu.banking.domain.exception.DailyLimitExceededException;
import com.devsu.banking.domain.exception.InsufficientBalanceException;
import com.devsu.banking.domain.exception.ResourceNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponseDTO> handleResourceNotFound(
            ResourceNotFoundException ex, HttpServletRequest request) {
        log.warn("Resource not found: {}", ex.getMessage());
        return buildErrorResponse(HttpStatus.NOT_FOUND, ex.getMessage(), request);
    }

    @ExceptionHandler(InsufficientBalanceException.class)
    public ResponseEntity<ErrorResponseDTO> handleInsufficientBalance(
            InsufficientBalanceException ex, HttpServletRequest request) {
        log.warn("Insufficient balance: {}", ex.getMessage());
        return buildErrorResponse(HttpStatus.BAD_REQUEST, ex.getMessage(), request);
    }

    @ExceptionHandler(DailyLimitExceededException.class)
    public ResponseEntity<ErrorResponseDTO> handleDailyLimitExceeded(
            DailyLimitExceededException ex, HttpServletRequest request) {
        log.warn("Daily limit exceeded: {}", ex.getMessage());
        return buildErrorResponse(HttpStatus.BAD_REQUEST, ex.getMessage(), request);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponseDTO> handleValidation(
            MethodArgumentNotValidException ex, HttpServletRequest request) {
        Map<String, String> validationErrors = new HashMap<>();
        ex.getBindingResult()
                .getFieldErrors()
                .forEach(
                        error -> validationErrors.put(error.getField(), error.getDefaultMessage()));

        ErrorResponseDTO errorResponse =
                ErrorResponseDTO.builder()
                        .timestamp(LocalDateTime.now())
                        .status(HttpStatus.BAD_REQUEST.value())
                        .error("Validation error")
                        .message("The provided data is not valid")
                        .path(request.getRequestURI())
                        .validationErrors(validationErrors)
                        .build();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponseDTO> handleIllegalArgument(
            IllegalArgumentException ex, HttpServletRequest request) {
        log.warn("Invalid argument: {}", ex.getMessage());
        return buildErrorResponse(HttpStatus.BAD_REQUEST, ex.getMessage(), request);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponseDTO> handleGeneral(
            Exception ex, HttpServletRequest request) {
        log.error("Unexpected error: {}", ex.getMessage(), ex);
        return buildErrorResponse(
                HttpStatus.INTERNAL_SERVER_ERROR, "Internal server error", request);
    }

    private ResponseEntity<ErrorResponseDTO> buildErrorResponse(
            HttpStatus status, String message, HttpServletRequest request) {
        ErrorResponseDTO errorResponse =
                ErrorResponseDTO.builder()
                        .timestamp(LocalDateTime.now())
                        .status(status.value())
                        .error(status.getReasonPhrase())
                        .message(message)
                        .path(request.getRequestURI())
                        .build();

        return ResponseEntity.status(status).body(errorResponse);
    }
}
