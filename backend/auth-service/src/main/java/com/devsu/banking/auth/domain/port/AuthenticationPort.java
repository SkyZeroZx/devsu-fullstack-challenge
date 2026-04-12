package com.devsu.banking.auth.domain.port;

public interface AuthenticationPort {

    String authenticate(String username, String password);
}
