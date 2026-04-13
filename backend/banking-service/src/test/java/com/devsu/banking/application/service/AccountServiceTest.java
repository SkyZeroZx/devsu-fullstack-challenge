package com.devsu.banking.application.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

import com.devsu.banking.application.dto.AccountRequestDTO;
import com.devsu.banking.application.dto.AccountResponseDTO;
import com.devsu.banking.application.dto.PagedResponseDTO;
import com.devsu.banking.application.mapper.AccountMapper;
import com.devsu.banking.domain.exception.ResourceNotFoundException;
import com.devsu.banking.domain.model.Account;
import com.devsu.banking.domain.model.AccountType;
import com.devsu.banking.domain.model.Client;
import com.devsu.banking.domain.repository.AccountRepository;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

@ExtendWith(MockitoExtension.class)
class AccountServiceTest {

    @Mock private AccountRepository accountRepository;

    @Mock private ClientService clientService;

    @Mock private AccountMapper accountMapper;

    @InjectMocks private AccountService accountService;

    private AccountRequestDTO requestDTO;
    private Account account;
    private AccountResponseDTO responseDTO;
    private Client client;

    @BeforeEach
    void setUp() {
        client = Client.builder().contrasena("encoded").estado(true).build();
        client.setId(1L);

        requestDTO =
                AccountRequestDTO.builder()
                        .numeroCuenta("478758")
                        .tipoCuenta("AHORRO")
                        .saldoInicial(new BigDecimal("2000"))
                        .estado(true)
                        .clienteId("CLI-001")
                        .build();

        account =
                Account.builder()
                        .numeroCuenta("478758")
                        .tipoCuenta(AccountType.AHORRO)
                        .saldoInicial(new BigDecimal("2000"))
                        .estado(true)
                        .cliente(client)
                        .build();
        account.setId(1L);

        responseDTO =
                AccountResponseDTO.builder()
                        .numeroCuenta("478758")
                        .tipoCuenta("AHORRO")
                        .saldoInicial(new BigDecimal("2000"))
                        .estado(true)
                        .clienteId("CLI-001")
                        .cliente("Jose Lema")
                        .build();
    }

    @Test
    @DisplayName("findAll - should return paged accounts when search is null")
    void findAll_withNullSearch_returnsPage() {
        Pageable pageable = PageRequest.of(0, 20);
        when(accountRepository.search("", pageable)).thenReturn(new PageImpl<>(List.of(account)));
        when(accountMapper.toResponseDTO(any(Account.class))).thenReturn(responseDTO);

        PagedResponseDTO<AccountResponseDTO> result = accountService.findAll(null, pageable);

        assertThat(result.content()).hasSize(1);
        assertThat(result.content().get(0).getNumeroCuenta()).isEqualTo("478758");
        verify(accountRepository).search("", pageable);
    }

    @Test
    @DisplayName("findAll - should pass search term to repository")
    void findAll_withSearchTerm_passesTermToRepository() {
        Pageable pageable = PageRequest.of(0, 20);
        when(accountRepository.search("478", pageable))
                .thenReturn(new PageImpl<>(List.of(account)));
        when(accountMapper.toResponseDTO(any(Account.class))).thenReturn(responseDTO);

        PagedResponseDTO<AccountResponseDTO> result = accountService.findAll("478", pageable);

        assertThat(result.content()).hasSize(1);
        verify(accountRepository).search("478", pageable);
    }

    @Test
    @DisplayName("findByAccountNumber - should return account when found")
    void findByAccountNumber_found_returnsDTO() {
        when(accountRepository.findByNumeroCuenta("478758")).thenReturn(Optional.of(account));
        when(accountMapper.toResponseDTO(account)).thenReturn(responseDTO);

        AccountResponseDTO result = accountService.findByAccountNumber("478758");

        assertThat(result).isNotNull();
        assertThat(result.getNumeroCuenta()).isEqualTo("478758");
        assertThat(result.getTipoCuenta()).isEqualTo("AHORRO");
    }

    @Test
    @DisplayName("findByAccountNumber - should throw ResourceNotFoundException when not found")
    void findByAccountNumber_notFound_throwsException() {
        when(accountRepository.findByNumeroCuenta("MISSING")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> accountService.findByAccountNumber("MISSING"))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Account")
                .hasMessageContaining("MISSING");
    }

    @Test
    @DisplayName("create - should persist and return the created account")
    void create_success_persistsAndReturnsDTO() {
        when(clientService.findClientByClienteId("CLI-001")).thenReturn(client);
        when(accountMapper.toEntity(requestDTO, client)).thenReturn(account);
        when(accountRepository.save(account)).thenReturn(account);
        when(accountMapper.toResponseDTO(account)).thenReturn(responseDTO);

        AccountResponseDTO result = accountService.create(requestDTO);

        assertThat(result).isNotNull();
        assertThat(result.getNumeroCuenta()).isEqualTo("478758");
        verify(clientService).findClientByClienteId("CLI-001");
        verify(accountRepository).save(account);
    }

    @Test
    @DisplayName("create - should throw ResourceNotFoundException when client does not exist")
    void create_clientNotFound_throwsException() {
        when(clientService.findClientByClienteId(anyString()))
                .thenThrow(new ResourceNotFoundException("Client", "clienteId", "CLI-001"));

        assertThatThrownBy(() -> accountService.create(requestDTO))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Client");

        verify(accountRepository, never()).save(any());
    }

    @Test
    @DisplayName("update - should update account fields and return updated DTO")
    void update_success_returnsUpdatedDTO() {
        when(accountRepository.findByNumeroCuenta("478758")).thenReturn(Optional.of(account));
        doNothing()
                .when(accountMapper)
                .updateEntity(any(Account.class), any(AccountRequestDTO.class));
        when(clientService.findClientByClienteId("CLI-001")).thenReturn(client);
        when(accountRepository.save(account)).thenReturn(account);
        when(accountMapper.toResponseDTO(account)).thenReturn(responseDTO);

        AccountResponseDTO result = accountService.update("478758", requestDTO);

        assertThat(result).isNotNull();
        assertThat(result.getNumeroCuenta()).isEqualTo("478758");
        verify(accountMapper).updateEntity(account, requestDTO);
        verify(accountRepository).save(account);
    }

    @Test
    @DisplayName("update - should skip client lookup when clienteId is null")
    void update_nullClienteId_skipsClientLookup() {
        AccountRequestDTO noClientRequest =
                AccountRequestDTO.builder()
                        .numeroCuenta("478758")
                        .tipoCuenta("CORRIENTE")
                        .saldoInicial(new BigDecimal("500"))
                        .estado(true)
                        .clienteId(null)
                        .build();

        when(accountRepository.findByNumeroCuenta("478758")).thenReturn(Optional.of(account));
        doNothing()
                .when(accountMapper)
                .updateEntity(any(Account.class), any(AccountRequestDTO.class));
        when(accountRepository.save(account)).thenReturn(account);
        when(accountMapper.toResponseDTO(account)).thenReturn(responseDTO);

        accountService.update("478758", noClientRequest);

        verify(clientService, never()).findClientByClienteId(anyString());
        verify(accountRepository).save(account);
    }

    @Test
    @DisplayName("update - should throw ResourceNotFoundException when account does not exist")
    void update_accountNotFound_throwsException() {
        when(accountRepository.findByNumeroCuenta("MISSING")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> accountService.update("MISSING", requestDTO))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Account");
    }

    @Test
    @DisplayName("partialUpdate - should apply partial changes and return updated DTO")
    void partialUpdate_success_returnsUpdatedDTO() {
        AccountRequestDTO partial =
                AccountRequestDTO.builder()
                        .numeroCuenta(null)
                        .tipoCuenta(null)
                        .saldoInicial(null)
                        .estado(false)
                        .clienteId(null)
                        .build();

        when(accountRepository.findByNumeroCuenta("478758")).thenReturn(Optional.of(account));
        doNothing()
                .when(accountMapper)
                .partialUpdateEntity(any(Account.class), any(AccountRequestDTO.class));
        when(accountRepository.save(account)).thenReturn(account);
        when(accountMapper.toResponseDTO(account)).thenReturn(responseDTO);

        AccountResponseDTO result = accountService.partialUpdate("478758", partial);

        assertThat(result).isNotNull();
        verify(accountMapper).partialUpdateEntity(account, partial);
        verify(clientService, never()).findClientByClienteId(anyString());
    }

    @Test
    @DisplayName("partialUpdate - should update client when clienteId is provided")
    void partialUpdate_withClienteId_updatesClient() {
        AccountRequestDTO partial =
                AccountRequestDTO.builder()
                        .numeroCuenta(null)
                        .tipoCuenta(null)
                        .saldoInicial(null)
                        .estado(null)
                        .clienteId("CLI-002")
                        .build();

        when(accountRepository.findByNumeroCuenta("478758")).thenReturn(Optional.of(account));
        doNothing()
                .when(accountMapper)
                .partialUpdateEntity(any(Account.class), any(AccountRequestDTO.class));
        when(clientService.findClientByClienteId("CLI-002")).thenReturn(client);
        when(accountRepository.save(account)).thenReturn(account);
        when(accountMapper.toResponseDTO(account)).thenReturn(responseDTO);

        accountService.partialUpdate("478758", partial);

        verify(clientService).findClientByClienteId("CLI-002");
        verify(accountRepository).save(account);
    }

    @Test
    @DisplayName("partialUpdate - should throw ResourceNotFoundException when account not found")
    void partialUpdate_accountNotFound_throwsException() {
        when(accountRepository.findByNumeroCuenta("MISSING")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> accountService.partialUpdate("MISSING", requestDTO))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Account");
    }

    @Test
    @DisplayName("delete - should delete account when found")
    void delete_success_deletesAccount() {
        when(accountRepository.findByNumeroCuenta("478758")).thenReturn(Optional.of(account));
        doNothing().when(accountRepository).delete(account);

        accountService.delete("478758");

        verify(accountRepository).delete(account);
    }

    @Test
    @DisplayName("delete - should throw ResourceNotFoundException when account does not exist")
    void delete_notFound_throwsException() {
        when(accountRepository.findByNumeroCuenta("NOTFOUND")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> accountService.delete("NOTFOUND"))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Account")
                .hasMessageContaining("NOTFOUND");

        verify(accountRepository, never()).delete(any());
    }

    @Test
    @DisplayName("findAccountByNumber - should return account entity when found")
    void findAccountByNumber_found_returnsEntity() {
        when(accountRepository.findByNumeroCuenta("478758")).thenReturn(Optional.of(account));

        Account result = accountService.findAccountByNumber("478758");

        assertThat(result).isNotNull();
        assertThat(result.getNumeroCuenta()).isEqualTo("478758");
        assertThat(result.getTipoCuenta()).isEqualTo(AccountType.AHORRO);
    }
}
