package com.devsu.banking.application.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.devsu.banking.application.dto.TransactionRequestDTO;
import com.devsu.banking.application.dto.TransactionResponseDTO;
import com.devsu.banking.application.mapper.TransactionMapper;
import com.devsu.banking.domain.exception.DailyLimitExceededException;
import com.devsu.banking.domain.exception.InsufficientBalanceException;
import com.devsu.banking.domain.exception.ResourceNotFoundException;
import com.devsu.banking.domain.model.*;
import com.devsu.banking.domain.repository.TransactionRepository;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class TransactionServiceTest {

    @Mock private TransactionRepository transactionRepository;

    @Mock private AccountService accountService;

    @Mock private TransactionMapper transactionMapper;

    @InjectMocks private TransactionService transactionService;

    private Client client;
    private Account account;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(
                transactionService, "dailyWithdrawalLimit", new BigDecimal("1000"));

        client =
                Client.builder()
                        .nombre("Jose Lema")
                        .genero("Masculino")
                        .edad(30)
                        .identificacion("1234567890")
                        .direccion("Otavalo sn y principal")
                        .telefono("098254785")
                        .clienteId("ABC12345")
                        .contrasena("encoded")
                        .estado(true)
                        .build();
        client.setId(1L);

        account =
                Account.builder()
                        .id(1L)
                        .numeroCuenta("478758")
                        .tipoCuenta(AccountType.AHORRO)
                        .saldoInicial(new BigDecimal("2000"))
                        .estado(true)
                        .cliente(client)
                        .build();
    }

    @Test
    @DisplayName("Should register a deposit successfully")
    void registerDeposit_success() {
        TransactionRequestDTO request =
                TransactionRequestDTO.builder()
                        .numeroCuenta("478758")
                        .tipoMovimiento("CREDITO")
                        .valor(new BigDecimal("600"))
                        .build();

        when(accountService.findAccountByNumber("478758")).thenReturn(account);
        when(transactionMapper.parseTransactionType("CREDITO")).thenReturn(TransactionType.CREDITO);
        when(transactionRepository.sumAmountByAccountId(1L)).thenReturn(BigDecimal.ZERO);

        Transaction savedTransaction =
                Transaction.builder()
                        .id(1L)
                        .fecha(LocalDateTime.now())
                        .tipoMovimiento(TransactionType.CREDITO)
                        .valor(new BigDecimal("600"))
                        .saldo(new BigDecimal("2600"))
                        .cuenta(account)
                        .build();
        when(transactionRepository.save(any(Transaction.class))).thenReturn(savedTransaction);

        TransactionResponseDTO expectedResponse =
                TransactionResponseDTO.builder()
                        .id(1L)
                        .tipoMovimiento("Crédito")
                        .valor(new BigDecimal("600"))
                        .saldo(new BigDecimal("2600"))
                        .numeroCuenta("478758")
                        .build();
        when(transactionMapper.toResponseDTO(any(Transaction.class))).thenReturn(expectedResponse);

        TransactionResponseDTO response = transactionService.register(request);

        assertThat(response).isNotNull();
        assertThat(response.getValor()).isEqualByComparingTo(new BigDecimal("600"));
        assertThat(response.getSaldo()).isEqualByComparingTo(new BigDecimal("2600"));
        verify(transactionRepository).save(any(Transaction.class));
    }

    @Test
    @DisplayName("Should register a withdrawal successfully")
    void registerWithdrawal_success() {
        TransactionRequestDTO request =
                TransactionRequestDTO.builder()
                        .numeroCuenta("478758")
                        .tipoMovimiento("DEBITO")
                        .valor(new BigDecimal("575"))
                        .build();

        when(accountService.findAccountByNumber("478758")).thenReturn(account);
        when(transactionMapper.parseTransactionType("DEBITO")).thenReturn(TransactionType.DEBITO);
        when(transactionRepository.sumAmountByAccountId(1L)).thenReturn(BigDecimal.ZERO);
        when(transactionRepository.sumDailyWithdrawalsByClientId(eq(1L), any(), any()))
                .thenReturn(BigDecimal.ZERO);

        Transaction savedTransaction =
                Transaction.builder()
                        .id(1L)
                        .fecha(LocalDateTime.now())
                        .tipoMovimiento(TransactionType.DEBITO)
                        .valor(new BigDecimal("-575"))
                        .saldo(new BigDecimal("1425"))
                        .cuenta(account)
                        .build();
        when(transactionRepository.save(any(Transaction.class))).thenReturn(savedTransaction);

        TransactionResponseDTO expectedResponse =
                TransactionResponseDTO.builder()
                        .id(1L)
                        .tipoMovimiento("Débito")
                        .valor(new BigDecimal("-575"))
                        .saldo(new BigDecimal("1425"))
                        .numeroCuenta("478758")
                        .build();
        when(transactionMapper.toResponseDTO(any(Transaction.class))).thenReturn(expectedResponse);

        TransactionResponseDTO response = transactionService.register(request);

        assertThat(response).isNotNull();
        assertThat(response.getValor()).isEqualByComparingTo(new BigDecimal("-575"));
        assertThat(response.getSaldo()).isEqualByComparingTo(new BigDecimal("1425"));
    }

    @Test
    @DisplayName("Should throw InsufficientBalanceException when balance is insufficient")
    void registerWithdrawal_insufficientBalance_throwsException() {
        Account emptyAccount =
                Account.builder()
                        .id(2L)
                        .numeroCuenta("495878")
                        .tipoCuenta(AccountType.AHORRO)
                        .saldoInicial(BigDecimal.ZERO)
                        .estado(true)
                        .cliente(client)
                        .build();

        TransactionRequestDTO request =
                TransactionRequestDTO.builder()
                        .numeroCuenta("495878")
                        .tipoMovimiento("DEBITO")
                        .valor(new BigDecimal("100"))
                        .build();

        when(accountService.findAccountByNumber("495878")).thenReturn(emptyAccount);
        when(transactionMapper.parseTransactionType("DEBITO")).thenReturn(TransactionType.DEBITO);
        when(transactionRepository.sumAmountByAccountId(2L)).thenReturn(BigDecimal.ZERO);

        assertThatThrownBy(() -> transactionService.register(request))
                .isInstanceOf(InsufficientBalanceException.class)
                .hasMessage("Saldo no disponible");
    }

    @Test
    @DisplayName("Should throw DailyLimitExceededException when daily limit is exceeded")
    void registerWithdrawal_dailyLimitExceeded_throwsException() {
        TransactionRequestDTO request =
                TransactionRequestDTO.builder()
                        .numeroCuenta("478758")
                        .tipoMovimiento("DEBITO")
                        .valor(new BigDecimal("500"))
                        .build();

        when(accountService.findAccountByNumber("478758")).thenReturn(account);
        when(transactionMapper.parseTransactionType("DEBITO")).thenReturn(TransactionType.DEBITO);
        when(transactionRepository.sumAmountByAccountId(1L)).thenReturn(BigDecimal.ZERO);
        when(transactionRepository.sumDailyWithdrawalsByClientId(eq(1L), any(), any()))
                .thenReturn(new BigDecimal("800"));

        assertThatThrownBy(() -> transactionService.register(request))
                .isInstanceOf(DailyLimitExceededException.class)
                .hasMessage("Cupo diario Excedido");
    }

    @Test
    @DisplayName("Should return a transaction by id")
    void findById_success() {
        Transaction transaction =
                Transaction.builder()
                        .id(1L)
                        .fecha(LocalDateTime.now())
                        .tipoMovimiento(TransactionType.CREDITO)
                        .valor(new BigDecimal("600"))
                        .saldo(new BigDecimal("2600"))
                        .cuenta(account)
                        .build();

        when(transactionRepository.findById(1L)).thenReturn(Optional.of(transaction));

        TransactionResponseDTO expectedResponse =
                TransactionResponseDTO.builder()
                        .id(1L)
                        .tipoMovimiento("Crédito")
                        .valor(new BigDecimal("600"))
                        .saldo(new BigDecimal("2600"))
                        .numeroCuenta("478758")
                        .build();
        when(transactionMapper.toResponseDTO(any(Transaction.class))).thenReturn(expectedResponse);

        TransactionResponseDTO response = transactionService.findById(1L);

        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(1L);
    }

    @Test
    @DisplayName("Should throw exception when transaction does not exist")
    void findById_notFound_throwsException() {
        when(transactionRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> transactionService.findById(999L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Transaction");
    }
}
