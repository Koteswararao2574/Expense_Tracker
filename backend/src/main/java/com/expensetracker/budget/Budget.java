package com.expensetracker.budget;

import com.expensetracker.category.Category;
import com.expensetracker.shared.audit.AuditableEntity;
import com.expensetracker.user.User;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "budgets")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Budget extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // null = overall budget (all categories)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal limitAmount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    @Builder.Default
    private Period period = Period.MONTHLY;

    // Threshold at which to start alerting (e.g. 80 = 80%)
    @Column(nullable = false)
    @Builder.Default
    private int alertThresholdPercent = 80;

    @Column(nullable = false)
    @Builder.Default
    private boolean alertEnabled = true;

    public enum Period { WEEKLY, MONTHLY, YEARLY }
}
