package com.devsu.banking.domain.exception;

public class DailyLimitExceededException extends RuntimeException {

    public DailyLimitExceededException() {
        super("Cupo diario Excedido");
    }

    public DailyLimitExceededException(String message) {
        super(message);
    }
}
