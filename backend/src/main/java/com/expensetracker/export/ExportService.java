package com.expensetracker.export;

import com.expensetracker.transaction.Transaction;
import com.expensetracker.transaction.TransactionRepository;
import com.expensetracker.user.User;
import com.opencsv.CSVWriter;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.StringWriter;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ExportService {

    private final TransactionRepository transactionRepository;
    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final String[] HEADERS = {
        "Date", "Type", "Amount", "Currency", "Category", "Merchant", "Description"
    };

    @Transactional(readOnly = true)
    public byte[] exportToCsv(LocalDate from, LocalDate to) throws IOException {
        List<Transaction> transactions = getTransactions(from, to);
        StringWriter sw = new StringWriter();

        try (CSVWriter writer = new CSVWriter(sw)) {
            writer.writeNext(HEADERS);
            for (Transaction t : transactions) {
                writer.writeNext(toRow(t));
            }
        }
        return sw.toString().getBytes();
    }

    @Transactional(readOnly = true)
    public byte[] exportToExcel(LocalDate from, LocalDate to) throws IOException {
        List<Transaction> transactions = getTransactions(from, to);

        try (XSSFWorkbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet("Transactions");

            // ── Header row with bold style ────────────────────────────────────
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.LIGHT_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < HEADERS.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(HEADERS[i]);
                cell.setCellStyle(headerStyle);
            }

            // ── Data rows ────────────────────────────────────────────────────
            CellStyle expenseStyle = workbook.createCellStyle();
            Font expenseFont = workbook.createFont();
            expenseFont.setColor(IndexedColors.RED.getIndex());
            expenseStyle.setFont(expenseFont);

            int rowNum = 1;
            for (Transaction t : transactions) {
                Row row = sheet.createRow(rowNum++);
                String[] data = toRow(t);
                for (int i = 0; i < data.length; i++) {
                    Cell cell = row.createCell(i);
                    cell.setCellValue(data[i]);
                    if (i == 1 && "EXPENSE".equals(t.getType().name())) {
                        cell.setCellStyle(expenseStyle);
                    }
                }
            }

            // Auto-size columns
            for (int i = 0; i < HEADERS.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return out.toByteArray();
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private List<Transaction> getTransactions(LocalDate from, LocalDate to) {
        Long userId = ((User) SecurityContextHolder.getContext()
            .getAuthentication().getPrincipal()).getId();
        return transactionRepository.findAllForExport(userId, from, to);
    }

    private String[] toRow(Transaction t) {
        return new String[]{
            t.getTransactionDate().format(DATE_FMT),
            t.getType().name(),
            t.getAmount().toPlainString(),
            t.getCurrency(),
            t.getCategory() != null ? t.getCategory().getName() : "",
            t.getMerchant() != null ? t.getMerchant() : "",
            t.getDescription() != null ? t.getDescription() : ""
        };
    }
}
