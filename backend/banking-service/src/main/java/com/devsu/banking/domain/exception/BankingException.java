package com.devsu.banking.domain.exception;

import org.springframework.http.HttpStatus;

public abstract class BankingException extends RuntimeException {

    private final HttpStatus status;

    protected BankingException(String message, HttpStatus status) {
        super(message);
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }
}
