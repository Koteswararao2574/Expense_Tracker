package com.expensetracker.budget;

import com.expensetracker.shared.exception.ResourceNotFoundException;
import com.expensetracker.transaction.Transaction;
import com.expensetracker.transaction.TransactionRepository;
import com.expensetracker.user.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final TransactionRepository transactionRepository;

    @Transactional(readOnly = true)
    public List<BudgetStatusDTO> getAllBudgetStatuses() {
        Long userId = currentUserId();
        List<Budget> budgets = budgetRepository.findByUserId(userId);
        return budgets.stream()
            .map(b -> buildStatus(b, userId))
            .toList();
    }

    @Transactional
    public Budget create(BudgetRequest request) {
        User user = getCurrentUser();
        Budget budget = Budget.builder()
            .user(user)
            .limitAmount(request.getLimitAmount())
            .period(Budget.Period.valueOf(request.getPeriod()))
            .alertThresholdPercent(request.getAlertThresholdPercent())
            .alertEnabled(request.isAlertEnabled())
            .build();
        return budgetRepository.save(budget);
    }

    @Transactional
    public void delete(Long id) {
        Budget budget = budgetRepository.findByIdAndUserId(id, currentUserId())
            .orElseThrow(() -> new ResourceNotFoundException("Budget", id));
        budgetRepository.delete(budget);
    }

    /**
     * Called after a new expense transaction is saved.
     * Checks all active budgets and logs/emits alerts when thresholds are breached.
     */
    public void checkBudgetThresholds(Long userId, Transaction savedTransaction) {
        List<Budget> budgets = budgetRepository.findByUserIdAndAlertEnabledTrue(userId);

        for (Budget budget : budgets) {
            LocalDate[] range = getPeriodRange(budget.getPeriod());
            BigDecimal spent;

            if (budget.getCategory() != null) {
                // Category-scoped budget
                if (!budget.getCategory().getId().equals(
                    savedTransaction.getCategory() != null
                        ? savedTransaction.getCategory().getId() : null)) {
                    continue;
                }
                spent = transactionRepository.sumExpensesByCategoryAndDateRange(
                    userId, budget.getCategory().getId(), range[0], range[1]);
            } else {
                // Overall budget
                spent = transactionRepository.sumAllExpensesByDateRange(userId, range[0], range[1]);
            }

            BigDecimal percentUsed = spent
                .multiply(BigDecimal.valueOf(100))
                .divide(budget.getLimitAmount(), 2, RoundingMode.HALF_UP);

            if (percentUsed.compareTo(BigDecimal.valueOf(budget.getAlertThresholdPercent())) >= 0) {
                log.warn("Budget alert! User {} has used {}% of {} budget (limit: {})",
                    userId, percentUsed, budget.getPeriod(), budget.getLimitAmount());
                // TODO: push to WebSocket / send email notification
            }
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private BudgetStatusDTO buildStatus(Budget budget, Long userId) {
        LocalDate[] range = getPeriodRange(budget.getPeriod());
        BigDecimal spent = budget.getCategory() != null
            ? transactionRepository.sumExpensesByCategoryAndDateRange(
                userId, budget.getCategory().getId(), range[0], range[1])
            : transactionRepository.sumAllExpensesByDateRange(userId, range[0], range[1]);

        BigDecimal remaining = budget.getLimitAmount().subtract(spent);
        BigDecimal percentUsed = spent
            .multiply(BigDecimal.valueOf(100))
            .divide(budget.getLimitAmount(), 1, RoundingMode.HALF_UP);

        return BudgetStatusDTO.builder()
            .budgetId(budget.getId())
            .limitAmount(budget.getLimitAmount())
            .spent(spent)
            .remaining(remaining.max(BigDecimal.ZERO))
            .percentUsed(percentUsed)
            .period(budget.getPeriod().name())
            .alertThresholdPercent(budget.getAlertThresholdPercent())
            .isOverBudget(remaining.compareTo(BigDecimal.ZERO) < 0)
            .categoryName(budget.getCategory() != null ? budget.getCategory().getName() : "Overall")
            .build();
    }

    private LocalDate[] getPeriodRange(Budget.Period period) {
        LocalDate now = LocalDate.now();
        return switch (period) {
            case WEEKLY  -> new LocalDate[]{ now.with(java.time.DayOfWeek.MONDAY), now };
            case MONTHLY -> new LocalDate[]{ now.withDayOfMonth(1), now };
            case YEARLY  -> new LocalDate[]{ now.withDayOfYear(1), now };
        };
    }

    private Long currentUserId() {
        return getCurrentUser().getId();
    }

    private User getCurrentUser() {
        return (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }
}
