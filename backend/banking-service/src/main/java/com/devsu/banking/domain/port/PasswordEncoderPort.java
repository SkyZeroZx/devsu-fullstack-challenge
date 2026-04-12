package com.devsu.banking.domain.port;

public interface PasswordEncoderPort {

    String encode(String rawPassword);
}
