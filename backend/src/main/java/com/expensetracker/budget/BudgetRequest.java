package com.expensetracker.budget;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class BudgetRequest {

    @NotNull
    @DecimalMin("1.00")
    private BigDecimal limitAmount;

    @NotBlank
    @Pattern(regexp = "WEEKLY|MONTHLY|YEARLY")
    private String period;

    @Min(1) @Max(100)
    private int alertThresholdPercent = 80;

    private boolean alertEnabled = true;
    private Long categoryId;
}
