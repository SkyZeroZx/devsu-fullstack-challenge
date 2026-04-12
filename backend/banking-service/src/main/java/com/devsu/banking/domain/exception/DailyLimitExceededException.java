package com.devsu.banking.domain.exception;

import org.springframework.http.HttpStatus;

public class DailyLimitExceededException extends BankingException {

    public DailyLimitExceededException() {
        super("Cupo diario Excedido", HttpStatus.BAD_REQUEST);
    }

    public DailyLimitExceededException(String message) {
        super(message, HttpStatus.BAD_REQUEST);
    }
}
