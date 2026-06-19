package com.expensetracker.recurring;

import com.expensetracker.category.Category;
import com.expensetracker.shared.audit.AuditableEntity;
import com.expensetracker.transaction.Transaction;
import com.expensetracker.user.User;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "recurring_rules")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecurringTemplate extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @Column(nullable = false, length = 150)
    private String name;   // e.g. "Netflix subscription"

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false, length = 10)
    @Builder.Default
    private String currency = "USD";

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private Transaction.TransactionType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Frequency frequency;

    // Day of month (for MONTHLY) or day of week (for WEEKLY) to fire
    private Integer dayOfPeriod;

    @Column(nullable = false)
    private LocalDate startDate;

    private LocalDate endDate;   // null = runs indefinitely

    @Column(nullable = false)
    private LocalDate nextRunDate;

    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;

    public enum Frequency { DAILY, WEEKLY, MONTHLY, YEARLY }
}
