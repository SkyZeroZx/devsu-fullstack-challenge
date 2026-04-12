package com.devsu.banking.domain.exception;

import org.springframework.http.HttpStatus;

public class ResourceNotFoundException extends BankingException {

    public ResourceNotFoundException(String resource, String field, Object value) {
        super(String.format("%s not found with %s: '%s'", resource, field, value), HttpStatus.NOT_FOUND);
    }

    public ResourceNotFoundException(String message) {
        super(message, HttpStatus.NOT_FOUND);
    }
}
