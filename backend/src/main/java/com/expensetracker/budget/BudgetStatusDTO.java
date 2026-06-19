package com.expensetracker.budget;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Builder
public class BudgetStatusDTO {
    private Long budgetId;
    private String categoryName;
    private BigDecimal limitAmount;
    private BigDecimal spent;
    private BigDecimal remaining;
    private BigDecimal percentUsed;
    private String period;
    private int alertThresholdPercent;
    private boolean isOverBudget;
}
