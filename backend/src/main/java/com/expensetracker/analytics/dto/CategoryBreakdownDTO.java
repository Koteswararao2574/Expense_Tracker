package com.expensetracker.analytics.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

// ── CategoryBreakdownDTO ──────────────────────────────────────────────────────
// Used in JPQL constructor expression — field order must match constructor

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CategoryBreakdownDTO {
    private String categoryName;
    private String color;
    private BigDecimal totalAmount;
    private Long transactionCount;
}
