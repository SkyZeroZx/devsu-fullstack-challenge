package com.devsu.banking.infrastructure.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.devsu.banking.application.dto.PagedResponseDTO;
import com.devsu.banking.application.dto.ReportResponseDTO;
import com.devsu.banking.application.service.ReportService;
import com.devsu.banking.infrastructure.exception.GlobalExceptionHandler;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.Pageable;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(ReportController.class)
@Import(GlobalExceptionHandler.class)
class ReportControllerTest {

    @Autowired private MockMvc mockMvc;

    @MockitoBean private ReportService reportService;

    private final ReportResponseDTO mockRow =
            ReportResponseDTO.builder()
                    .fecha("15/1/2024")
                    .cliente("Jose Lema")
                    .numeroCuenta("478758")
                    .tipo("Ahorros")
                    .saldoInicial(BigDecimal.valueOf(2000))
                    .estado(true)
                    .movimiento(BigDecimal.valueOf(500))
                    .saldoDisponible(BigDecimal.valueOf(2500))
                    .build();

    private static final PagedResponseDTO<ReportResponseDTO> PAGED_SINGLE =
            new PagedResponseDTO<>(List.of(), 1, 20, 0, 0, true, true);

    @Test
    @DisplayName("GET /api/reportes - Should return paged report for a specific client")
    void getJsonReport_withCliente_returnsOk() throws Exception {
        PagedResponseDTO<ReportResponseDTO> paged =
                new PagedResponseDTO<>(List.of(mockRow), 1, 20, 1, 1, true, true);

        when(reportService.generateJsonReport(
                        eq("ABC12345"),
                        eq(LocalDate.of(2024, 1, 1)),
                        eq(LocalDate.of(2024, 1, 31)),
                        any(Pageable.class)))
                .thenReturn(paged);

        mockMvc.perform(
                        get("/api/reportes")
                                .param("cliente", "ABC12345")
                                .param("fechaInicio", "2024-01-01")
                                .param("fechaFin", "2024-01-31"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].cliente").value("Jose Lema"))
                .andExpect(jsonPath("$.content[0].numeroCuenta").value("478758"))
                .andExpect(jsonPath("$.totalElements").value(1))
                .andExpect(jsonPath("$.page").value(1));
    }

    @Test
    @DisplayName(
            "GET /api/reportes - Should return paged report for all clients when no cliente param")
    void getJsonReport_withoutCliente_returnsOk() throws Exception {
        PagedResponseDTO<ReportResponseDTO> paged =
                new PagedResponseDTO<>(List.of(mockRow), 1, 20, 1, 1, true, true);

        when(reportService.generateJsonReport(
                        isNull(), any(LocalDate.class), any(LocalDate.class), any(Pageable.class)))
                .thenReturn(paged);

        mockMvc.perform(
                        get("/api/reportes")
                                .param("fechaInicio", "2024-01-01")
                                .param("fechaFin", "2024-01-31"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].cliente").value("Jose Lema"))
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    @Test
    @DisplayName("GET /api/reportes - Should return 400 when dates are missing")
    void getJsonReport_missingDates_returns400() throws Exception {
        mockMvc.perform(get("/api/reportes").param("cliente", "ABC12345"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("GET /api/reportes - Should return empty page when no results")
    void getJsonReport_noResults_returnsEmptyPage() throws Exception {
        PagedResponseDTO<ReportResponseDTO> empty =
                new PagedResponseDTO<>(List.of(), 1, 20, 0, 0, true, true);

        when(reportService.generateJsonReport(any(), any(), any(), any(Pageable.class)))
                .thenReturn(empty);

        mockMvc.perform(
                        get("/api/reportes")
                                .param("fechaInicio", "2024-01-01")
                                .param("fechaFin", "2024-01-31"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isEmpty())
                .andExpect(jsonPath("$.totalElements").value(0));
    }

    @Test
    @DisplayName("GET /api/reportes/pdf - Should return PDF base64 for a specific client")
    void getPdfReport_withCliente_returnsOk() throws Exception {
        when(reportService.generatePdfReportBase64(
                        eq("ABC12345"),
                        eq(LocalDate.of(2024, 1, 1)),
                        eq(LocalDate.of(2024, 1, 31))))
                .thenReturn("base64encodedpdf");

        mockMvc.perform(
                        get("/api/reportes/pdf")
                                .param("cliente", "ABC12345")
                                .param("fechaInicio", "2024-01-01")
                                .param("fechaFin", "2024-01-31"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.reporte").value("base64encodedpdf"));
    }

    @Test
    @DisplayName(
            "GET /api/reportes/pdf - Should return PDF base64 for all clients when no cliente param")
    void getPdfReport_withoutCliente_returnsOk() throws Exception {
        when(reportService.generatePdfReportBase64(
                        isNull(), any(LocalDate.class), any(LocalDate.class)))
                .thenReturn("base64encodedpdfallclients");

        mockMvc.perform(
                        get("/api/reportes/pdf")
                                .param("fechaInicio", "2024-01-01")
                                .param("fechaFin", "2024-01-31"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.reporte").value("base64encodedpdfallclients"));
    }

    @Test
    @DisplayName("GET /api/reportes/pdf - Should return 400 when dates are missing")
    void getPdfReport_missingDates_returns400() throws Exception {
        mockMvc.perform(get("/api/reportes/pdf").param("cliente", "ABC12345"))
                .andExpect(status().isBadRequest());
    }
}
