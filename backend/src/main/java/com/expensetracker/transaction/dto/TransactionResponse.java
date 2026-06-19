package com.expensetracker.transaction.dto;

import com.expensetracker.transaction.Transaction;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class TransactionResponse {
    private Long id;
    private BigDecimal amount;
    private String currency;
    private String type;
    private LocalDate transactionDate;
    private String description;
    private String merchant;
    private Long categoryId;
    private String categoryName;
    private String categoryColor;
    private LocalDateTime createdAt;

    public static TransactionResponse from(Transaction t) {
        return TransactionResponse.builder()
            .id(t.getId())
            .amount(t.getAmount())
            .currency(t.getCurrency())
            .type(t.getType().name())
            .transactionDate(t.getTransactionDate())
            .description(t.getDescription())
            .merchant(t.getMerchant())
            .categoryId(t.getCategory() != null ? t.getCategory().getId() : null)
            .categoryName(t.getCategory() != null ? t.getCategory().getName() : null)
            .categoryColor(t.getCategory() != null ? t.getCategory().getColor() : null)
            .createdAt(t.getCreatedAt())
            .build();
    }
}
