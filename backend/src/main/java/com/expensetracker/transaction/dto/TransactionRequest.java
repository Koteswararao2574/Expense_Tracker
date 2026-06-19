package com.expensetracker.transaction.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class TransactionRequest {

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be positive")
    @Digits(integer = 13, fraction = 2)
    private BigDecimal amount;

    @NotBlank
    @Size(max = 10)
    private String currency = "USD";

    @NotBlank(message = "Type must be INCOME or EXPENSE")
    @Pattern(regexp = "INCOME|EXPENSE", message = "Type must be INCOME or EXPENSE")
    private String type;

    @NotNull(message = "Transaction date is required")
    @PastOrPresent(message = "Date cannot be in the future")
    private LocalDate transactionDate;

    @Size(max = 500)
    private String description;

    @Size(max = 100)
    private String merchant;

    private Long categoryId;
}
