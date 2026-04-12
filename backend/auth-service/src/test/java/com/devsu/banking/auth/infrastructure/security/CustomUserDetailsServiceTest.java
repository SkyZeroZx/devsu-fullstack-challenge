package com.devsu.banking.auth.infrastructure.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

import com.devsu.banking.auth.domain.model.AuthUser;
import com.devsu.banking.auth.domain.model.Role;
import com.devsu.banking.auth.domain.repository.AuthUserRepository;
import java.util.Optional;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

@ExtendWith(MockitoExtension.class)
class CustomUserDetailsServiceTest {

    @Mock private AuthUserRepository authUserRepository;

    @InjectMocks private CustomUserDetailsService customUserDetailsService;

    @Test
    @DisplayName("Should return UserDetails when user is found")
    void loadUserByUsername_userFound_returnsUserDetails() {
        AuthUser authUser =
                AuthUser.builder()
                        .id(1L)
                        .username("testuser")
                        .password("$2a$10$encoded")
                        .role(Role.USER)
                        .enabled(true)
                        .build();

        when(authUserRepository.findByUsername("testuser")).thenReturn(Optional.of(authUser));

        UserDetails userDetails = customUserDetailsService.loadUserByUsername("testuser");

        assertThat(userDetails).isNotNull();
        assertThat(userDetails.getUsername()).isEqualTo("testuser");
        assertThat(userDetails.getPassword()).isEqualTo("$2a$10$encoded");
        assertThat(userDetails.isEnabled()).isTrue();
        assertThat(userDetails.getAuthorities())
                .extracting("authority")
                .containsExactly("ROLE_USER");
    }

    @Test
    @DisplayName("Should throw UsernameNotFoundException when user is not found")
    void loadUserByUsername_userNotFound_throwsUsernameNotFoundException() {
        when(authUserRepository.findByUsername("unknown")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> customUserDetailsService.loadUserByUsername("unknown"))
                .isInstanceOf(UsernameNotFoundException.class)
                .hasMessageContaining("User not found: unknown");
    }
}
