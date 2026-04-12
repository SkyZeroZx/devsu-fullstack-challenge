package com.devsu.banking.auth.domain.repository;

import com.devsu.banking.auth.domain.model.AuthUser;
import java.util.Optional;

public interface AuthUserRepository {

    Optional<AuthUser> findByUsername(String username);

    boolean existsByUsername(String username);

    AuthUser save(AuthUser user);
}
