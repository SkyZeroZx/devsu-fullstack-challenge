package com.devsu.banking.domain.exception;

import org.springframework.http.HttpStatus;

public class ReportGenerationException extends BankingException {

    public ReportGenerationException(String message, Throwable cause) {
        super(message, HttpStatus.INTERNAL_SERVER_ERROR, cause);
    }
}
