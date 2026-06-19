package com.expensetracker.recurring;

import com.expensetracker.transaction.Transaction;
import com.expensetracker.transaction.TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class RecurringScheduler {

    private final RecurringRepository recurringRepository;
    private final TransactionRepository transactionRepository;

    /**
     * Runs every day at 00:05 AM server time.
     * Finds all due recurring rules, creates the transactions, and advances next_run_date.
     */
    @Scheduled(cron = "0 5 0 * * *")
    @Transactional
    public void processRecurringTransactions() {
        LocalDate today = LocalDate.now();
        List<RecurringTemplate> due = recurringRepository
            .findByActiveTrueAndNextRunDateLessThanEqual(today);

        log.info("Recurring scheduler: {} rules to process for {}", due.size(), today);

        for (RecurringTemplate rule : due) {
            try {
                // Skip if past end date
                if (rule.getEndDate() != null && today.isAfter(rule.getEndDate())) {
                    rule.setActive(false);
                    recurringRepository.save(rule);
                    continue;
                }

                // Create the transaction from the rule template
                Transaction transaction = Transaction.builder()
                    .user(rule.getUser())
                    .category(rule.getCategory())
                    .amount(rule.getAmount())
                    .currency(rule.getCurrency())
                    .type(rule.getType())
                    .transactionDate(today)
                    .description("Auto: " + rule.getName())
                    .recurringRuleId(rule.getId())
                    .build();

                transactionRepository.save(transaction);

                // Advance next run date based on frequency
                rule.setNextRunDate(computeNextRunDate(rule, today));
                recurringRepository.save(rule);

                log.debug("Created recurring transaction for rule '{}' (user={})",
                    rule.getName(), rule.getUser().getId());

            } catch (Exception ex) {
                log.error("Failed to process recurring rule {}: {}", rule.getId(), ex.getMessage());
            }
        }
    }

    private LocalDate computeNextRunDate(RecurringTemplate rule, LocalDate from) {
        return switch (rule.getFrequency()) {
            case DAILY   -> from.plusDays(1);
            case WEEKLY  -> from.plusWeeks(1);
            case MONTHLY -> from.plusMonths(1);
            case YEARLY  -> from.plusYears(1);
        };
    }
}
