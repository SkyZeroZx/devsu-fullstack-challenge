package com.devsu.banking.application.service;

import com.devsu.banking.application.dto.ReportResponseDTO;
import com.devsu.banking.domain.model.Account;
import com.devsu.banking.domain.model.Client;
import com.devsu.banking.domain.model.Transaction;
import com.devsu.banking.domain.repository.AccountRepository;
import com.devsu.banking.domain.repository.TransactionRepository;
import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReportService {
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("d/M/yyyy");

    private final ClientService clientService;
    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;

    public List<ReportResponseDTO> generateJsonReport(
            String clienteId, LocalDate startDate, LocalDate endDate) {
        log.info(
                "Generating JSON report for client: {}, from: {} to: {}",
                clienteId,
                startDate,
                endDate);

        Client client = clientService.findClientByClienteId(clienteId);
        return buildReport(client, startDate, endDate);
    }

    public String generatePdfReportBase64(
            String clienteId, LocalDate startDate, LocalDate endDate) {
        log.info(
                "Generating PDF report for client: {}, from: {} to: {}",
                clienteId,
                startDate,
                endDate);

        Client client = clientService.findClientByClienteId(clienteId);
        List<ReportResponseDTO> reportData = buildReport(client, startDate, endDate);

        return generatePdf(reportData, client.getNombre(), startDate, endDate);
    }

    private List<ReportResponseDTO> buildReport(
            Client client, LocalDate startDate, LocalDate endDate) {
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(LocalTime.MAX);

        List<Account> accounts = accountRepository.findByClienteId(client.getId());
        List<ReportResponseDTO> report = new ArrayList<>();

        accounts.forEach(
                account -> {
                    List<Transaction> transactions =
                            transactionRepository.findByCuentaIdAndFechaBetween(
                                    account.getId(), start, end);

                    transactions.forEach(
                            transaction ->
                                    report.add(
                                            ReportResponseDTO.builder()
                                                    .fecha(
                                                            transaction
                                                                    .getFecha()
                                                                    .format(DATE_FORMATTER))
                                                    .cliente(client.getNombre())
                                                    .numeroCuenta(account.getNumeroCuenta())
                                                    .tipo(
                                                            formatAccountType(
                                                                    account.getTipoCuenta().name()))
                                                    .saldoInicial(account.getSaldoInicial())
                                                    .estado(account.getEstado())
                                                    .movimiento(transaction.getValor())
                                                    .saldoDisponible(transaction.getSaldo())
                                                    .build()));
                });

        return report;
    }

    private String generatePdf(
            List<ReportResponseDTO> data,
            String clientName,
            LocalDate startDate,
            LocalDate endDate) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4.rotate());
            PdfWriter.getInstance(document, baos);
            document.open();

            Font titleFont = new Font(Font.HELVETICA, 16, Font.BOLD, Color.DARK_GRAY);
            Font headerFont = new Font(Font.HELVETICA, 10, Font.BOLD, Color.WHITE);
            Font cellFont = new Font(Font.HELVETICA, 9, Font.NORMAL, Color.BLACK);

            Paragraph title = new Paragraph("Estado de Cuenta", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);

            document.add(
                    new Paragraph(
                            String.format("Cliente: %s", clientName),
                            new Font(Font.HELVETICA, 11, Font.NORMAL)));
            document.add(
                    new Paragraph(
                            String.format(
                                    "Período: %s - %s",
                                    startDate.format(DATE_FORMATTER),
                                    endDate.format(DATE_FORMATTER)),
                            new Font(Font.HELVETICA, 11, Font.NORMAL)));
            document.add(new Paragraph(" "));

            PdfPTable table = buildTable(data, headerFont, cellFont);
            document.add(table);
            document.close();

            return Base64.getEncoder().encodeToString(baos.toByteArray());
        } catch (Exception e) {
            log.error("Error generating PDF: {}", e.getMessage(), e);
            throw new RuntimeException("Error generating PDF report", e);
        }
    }

    private PdfPTable buildTable(List<ReportResponseDTO> data, Font headerFont, Font cellFont) {
        try {
            PdfPTable table = new PdfPTable(8);
            table.setWidthPercentage(100);
            float[] columnWidths = {10f, 15f, 12f, 10f, 12f, 8f, 12f, 12f};
            table.setWidths(columnWidths);

            String[] headers = {
                "Fecha", "Cliente", "Nro. Cuenta", "Tipo",
                "Saldo Inicial", "Estado", "Movimiento", "Saldo Disponible"
            };
            for (String header : headers) {
                PdfPCell cell = new PdfPCell(new Phrase(header, headerFont));
                cell.setBackgroundColor(new Color(51, 122, 183));
                cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                cell.setPadding(5);
                table.addCell(cell);
            }

            data.forEach(
                    row -> {
                        addCell(table, row.getFecha(), cellFont);
                        addCell(table, row.getCliente(), cellFont);
                        addCell(table, row.getNumeroCuenta(), cellFont);
                        addCell(table, row.getTipo(), cellFont);
                        addCell(table, row.getSaldoInicial().toString(), cellFont);
                        addCell(table, row.getEstado() ? "Activo" : "Inactivo", cellFont);
                        addCell(table, row.getMovimiento().toString(), cellFont);
                        addCell(table, row.getSaldoDisponible().toString(), cellFont);
                    });

            return table;
        } catch (Exception e) {
            throw new RuntimeException("Error building PDF table", e);
        }
    }

    private void addCell(PdfPTable table, String text, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setPadding(4);
        table.addCell(cell);
    }

    private String formatAccountType(String type) {
        return switch (type) {
            case "AHORRO" -> "Ahorros";
            case "CORRIENTE" -> "Corriente";
            default -> type;
        };
    }
}
