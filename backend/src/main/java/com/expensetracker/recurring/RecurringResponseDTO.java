package com.expensetracker.recurring;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
public class RecurringResponseDTO {
    private Long id;
    private String name;
    private BigDecimal amount;
    private String currency;
    private String type;
    private String frequency;
    private LocalDate startDate;
    private LocalDate endDate;
    private LocalDate nextRunDate;
    private boolean active;
    private Long categoryId;
    private String categoryName;

    public static RecurringResponseDTO from(RecurringTemplate t) {
        return RecurringResponseDTO.builder()
            .id(t.getId())
            .name(t.getName())
            .amount(t.getAmount())
            .currency(t.getCurrency())
            .type(t.getType().name())
            .frequency(t.getFrequency().name())
            .startDate(t.getStartDate())
            .endDate(t.getEndDate())
            .nextRunDate(t.getNextRunDate())
            .active(t.isActive())
            .categoryId(t.getCategory() != null ? t.getCategory().getId() : null)
            .categoryName(t.getCategory() != null ? t.getCategory().getName() : null)
            .build();
    }
}
