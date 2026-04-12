package com.devsu.banking.auth.domain.port;

public interface PasswordEncoderPort {

    String encode(String rawPassword);
}
