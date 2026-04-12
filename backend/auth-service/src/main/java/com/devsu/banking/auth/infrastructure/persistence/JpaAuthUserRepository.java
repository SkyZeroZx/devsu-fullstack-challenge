package com.devsu.banking.auth.infrastructure.persistence;

import com.devsu.banking.auth.domain.model.AuthUser;
import com.devsu.banking.auth.domain.repository.AuthUserRepository;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface JpaAuthUserRepository extends JpaRepository<AuthUser, Long>, AuthUserRepository {

    @Override
    Optional<AuthUser> findByUsername(String username);

    @Override
    boolean existsByUsername(String username);

    @Override
    AuthUser save(AuthUser user);
}
