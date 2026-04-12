package com.devsu.banking.domain.exception;

import org.springframework.http.HttpStatus;

public class InsufficientBalanceException extends BankingException {

    public InsufficientBalanceException() {
        super("Saldo no disponible", HttpStatus.BAD_REQUEST);
    }

    public InsufficientBalanceException(String message) {
        super(message, HttpStatus.BAD_REQUEST);
    }
}
