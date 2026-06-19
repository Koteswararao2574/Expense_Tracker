package com.expensetracker.recurring;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class RecurringRequestDTO {

    @NotBlank @Size(min = 2, max = 150)
    private String name;

    @NotNull @DecimalMin("0.01")
    private BigDecimal amount;

    @NotBlank @Size(max = 10)
    private String currency = "USD";

    @NotBlank @Pattern(regexp = "INCOME|EXPENSE")
    private String type;

    @NotBlank @Pattern(regexp = "DAILY|WEEKLY|MONTHLY|YEARLY")
    private String frequency;

    @NotNull
    private LocalDate startDate;

    private LocalDate endDate;

    private Long categoryId;
}
