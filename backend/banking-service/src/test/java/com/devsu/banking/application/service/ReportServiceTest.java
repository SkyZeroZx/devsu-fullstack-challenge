package com.devsu.banking.application.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.devsu.banking.application.dto.PagedResponseDTO;
import com.devsu.banking.application.dto.ReportResponseDTO;
import com.devsu.banking.domain.model.Account;
import com.devsu.banking.domain.model.AccountType;
import com.devsu.banking.domain.model.Client;
import com.devsu.banking.domain.model.Transaction;
import com.devsu.banking.domain.model.TransactionType;
import com.devsu.banking.domain.repository.TransactionRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
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
class ReportServiceTest {

    @Mock private TransactionRepository transactionRepository;

    @InjectMocks private ReportService reportService;

    private Client client;
    private Account account;
    private Transaction transaction;

    @BeforeEach
    void setUp() {
        client = Client.builder().nombre("Jose Lema").clienteId("ABC12345").build();
        client.setId(1L);

        account =
                Account.builder()
                        .numeroCuenta("478758")
                        .tipoCuenta(AccountType.AHORRO)
                        .saldoInicial(BigDecimal.valueOf(2000))
                        .estado(true)
                        .cliente(client)
                        .build();
        account.setId(10L);

        transaction =
                Transaction.builder()
                        .id(100L)
                        .fecha(LocalDateTime.of(2024, 1, 15, 10, 0))
                        .tipoMovimiento(TransactionType.CREDITO)
                        .valor(BigDecimal.valueOf(500))
                        .saldo(BigDecimal.valueOf(2500))
                        .cuenta(account)
                        .build();
    }

    @Test
    @DisplayName("Should return paged report for a specific client")
    void generateJsonReport_withClienteId_returnsPagedResult() {
        Pageable pageable = PageRequest.of(0, 20);
        when(transactionRepository.findPagedReport(
                        eq("ABC12345"),
                        any(LocalDateTime.class),
                        any(LocalDateTime.class),
                        eq(pageable)))
                .thenReturn(new PageImpl<>(List.of(transaction)));

        PagedResponseDTO<ReportResponseDTO> result =
                reportService.generateJsonReport(
                        "ABC12345", LocalDate.of(2024, 1, 1), LocalDate.of(2024, 1, 31), pageable);

        assertThat(result.content()).hasSize(1);
        ReportResponseDTO row = result.content().get(0);
        assertThat(row.getCliente()).isEqualTo("Jose Lema");
        assertThat(row.getNumeroCuenta()).isEqualTo("478758");
        assertThat(row.getTipo()).isEqualTo("Ahorros");
        assertThat(row.getMovimiento()).isEqualByComparingTo(BigDecimal.valueOf(500));
        assertThat(row.getSaldoDisponible()).isEqualByComparingTo(BigDecimal.valueOf(2500));
        assertThat(row.getEstado()).isTrue();
        verify(transactionRepository).findPagedReport(eq("ABC12345"), any(), any(), eq(pageable));
    }

    @Test
    @DisplayName("Should return paged report for all clients when clienteId is null")
    void generateJsonReport_withNullClienteId_returnsAllClients() {
        Pageable pageable = PageRequest.of(0, 20);
        when(transactionRepository.findPagedReport(
                        isNull(), any(LocalDateTime.class), any(LocalDateTime.class), eq(pageable)))
                .thenReturn(new PageImpl<>(List.of(transaction)));

        PagedResponseDTO<ReportResponseDTO> result =
                reportService.generateJsonReport(
                        null, LocalDate.of(2024, 1, 1), LocalDate.of(2024, 1, 31), pageable);

        assertThat(result.content()).hasSize(1);
        assertThat(result.totalElements()).isEqualTo(1);
        verify(transactionRepository).findPagedReport(isNull(), any(), any(), eq(pageable));
    }

    @Test
    @DisplayName("Should return empty paged result when no transactions found")
    void generateJsonReport_noTransactions_returnsEmptyPage() {
        Pageable pageable = PageRequest.of(0, 20);
        when(transactionRepository.findPagedReport(any(), any(), any(), eq(pageable)))
                .thenReturn(new PageImpl<>(List.of()));

        PagedResponseDTO<ReportResponseDTO> result =
                reportService.generateJsonReport(
                        "ABC12345", LocalDate.of(2024, 1, 1), LocalDate.of(2024, 1, 31), pageable);

        assertThat(result.content()).isEmpty();
        assertThat(result.totalElements()).isZero();
    }

    @Test
    @DisplayName("Should generate PDF base64 for a specific client")
    void generatePdfReportBase64_withClienteId_returnsPdf() {
        when(transactionRepository.findPagedReport(
                        eq("ABC12345"),
                        any(LocalDateTime.class),
                        any(LocalDateTime.class),
                        any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(transaction)));

        String pdf =
                reportService.generatePdfReportBase64(
                        "ABC12345", LocalDate.of(2024, 1, 1), LocalDate.of(2024, 1, 31));

        assertThat(pdf).isNotBlank();
        // PDF base64 encoding starts with 'J' (from the JVBERi0 PDF header)
        byte[] decoded = java.util.Base64.getDecoder().decode(pdf);
        assertThat(decoded[0]).isEqualTo((byte) '%');
        assertThat(decoded[1]).isEqualTo((byte) 'P');
    }

    @Test
    @DisplayName("Should generate PDF base64 for all clients when clienteId is null")
    void generatePdfReportBase64_withNullClienteId_returnsPdf() {
        when(transactionRepository.findPagedReport(
                        isNull(),
                        any(LocalDateTime.class),
                        any(LocalDateTime.class),
                        any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(transaction)));

        String pdf =
                reportService.generatePdfReportBase64(
                        null, LocalDate.of(2024, 1, 1), LocalDate.of(2024, 1, 31));

        assertThat(pdf).isNotBlank();
        verify(transactionRepository).findPagedReport(isNull(), any(), any(), any());
    }

    @Test
    @DisplayName("Should return correct page metadata in paged report")
    void generateJsonReport_returnsCorrectPageMetadata() {
        Pageable pageable = PageRequest.of(0, 5);
        when(transactionRepository.findPagedReport(any(), any(), any(), eq(pageable)))
                .thenReturn(new PageImpl<>(List.of(transaction), pageable, 10));

        PagedResponseDTO<ReportResponseDTO> result =
                reportService.generateJsonReport(
                        null, LocalDate.of(2024, 1, 1), LocalDate.of(2024, 1, 31), pageable);

        assertThat(result.totalElements()).isEqualTo(10);
        assertThat(result.size()).isEqualTo(5);
        assertThat(result.totalPages()).isEqualTo(2);
    }
}
