package com.expensetracker.transaction;

import com.expensetracker.category.Category;
import com.expensetracker.shared.audit.AuditableEntity;
import com.expensetracker.user.User;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "transactions", indexes = {
    @Index(name = "idx_txn_user",     columnList = "user_id"),
    @Index(name = "idx_txn_date",     columnList = "transaction_date"),
    @Index(name = "idx_txn_category", columnList = "category_id")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Transaction extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    // Original currency when multi-currency is used
    @Column(nullable = false, length = 10)
    @Builder.Default
    private String currency = "USD";

    // Amount in user's base currency after conversion
    @Column(precision = 15, scale = 2)
    private BigDecimal amountInBaseCurrency;

    @Column(precision = 10, scale = 6)
    private BigDecimal exchangeRate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private TransactionType type;  // INCOME | EXPENSE

    @Column(nullable = false)
    private LocalDate transactionDate;

    @Column(length = 500)
    private String description;

    @Column(length = 100)
    private String merchant;

    // Link to recurring rule that generated this transaction (nullable)
    @Column(name = "recurring_rule_id")
    private Long recurringRuleId;

    public enum TransactionType { INCOME, EXPENSE }
}
