package com.devsu.banking.infrastructure.controller;

import com.devsu.banking.application.dto.PagedResponseDTO;
import com.devsu.banking.application.dto.ReportResponseDTO;
import com.devsu.banking.application.service.ReportService;
import java.time.LocalDate;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reportes")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping
    public ResponseEntity<PagedResponseDTO<ReportResponseDTO>> getJsonReport(
            @RequestParam(required = false) String cliente,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaInicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaFin,
            @PageableDefault(size = 20, sort = "fecha", direction = Sort.Direction.DESC)
                    Pageable pageable) {
        return ResponseEntity.ok(
                reportService.generateJsonReport(cliente, fechaInicio, fechaFin, pageable));
    }

    @GetMapping("/pdf")
    public ResponseEntity<Map<String, String>> getPdfReport(
            @RequestParam(required = false) String cliente,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaInicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaFin) {
        String pdfBase64 = reportService.generatePdfReportBase64(cliente, fechaInicio, fechaFin);
        return ResponseEntity.ok(Map.of("reporte", pdfBase64));
    }
}
