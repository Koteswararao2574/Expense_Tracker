package com.expensetracker.transaction;

import com.expensetracker.analytics.dto.CategoryBreakdownDTO;
import com.expensetracker.analytics.dto.MonthlyTrendDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository
    extends JpaRepository<Transaction, Long>, JpaSpecificationExecutor<Transaction> {

    // ── Basic queries ─────────────────────────────────────────────────────────

    Page<Transaction> findByUserIdOrderByTransactionDateDesc(Long userId, Pageable pageable);

    Optional<Transaction> findByIdAndUserId(Long id, Long userId);

    // ── Date-range sum queries (for budget checking) ──────────────────────────

    @Query("""
        SELECT COALESCE(SUM(t.amount), 0)
        FROM Transaction t
        WHERE t.user.id = :userId
          AND t.type = 'EXPENSE'
          AND t.category.id = :categoryId
          AND t.transactionDate BETWEEN :from AND :to
        """)
    BigDecimal sumExpensesByCategoryAndDateRange(
        @Param("userId") Long userId,
        @Param("categoryId") Long categoryId,
        @Param("from") LocalDate from,
        @Param("to") LocalDate to
    );

    @Query("""
        SELECT COALESCE(SUM(t.amount), 0)
        FROM Transaction t
        WHERE t.user.id = :userId
          AND t.type = 'EXPENSE'
          AND t.transactionDate BETWEEN :from AND :to
        """)
    BigDecimal sumAllExpensesByDateRange(
        @Param("userId") Long userId,
        @Param("from") LocalDate from,
        @Param("to") LocalDate to
    );

    // ── Analytics: category breakdown ─────────────────────────────────────────

    @Query("""
        SELECT new com.expensetracker.analytics.dto.CategoryBreakdownDTO(
            c.name, c.color, SUM(t.amount), COUNT(t.id)
        )
        FROM Transaction t
        JOIN t.category c
        WHERE t.user.id = :userId
          AND t.type = 'EXPENSE'
          AND t.transactionDate BETWEEN :from AND :to
        GROUP BY c.id, c.name, c.color
        ORDER BY SUM(t.amount) DESC
        """)
    List<CategoryBreakdownDTO> getCategoryBreakdown(
        @Param("userId") Long userId,
        @Param("from") LocalDate from,
        @Param("to") LocalDate to
    );

    // ── Analytics: monthly trend ──────────────────────────────────────────────

    @Query("""
        SELECT new com.expensetracker.analytics.dto.MonthlyTrendDTO(
            YEAR(t.transactionDate), MONTH(t.transactionDate),
            SUM(CASE WHEN t.type = 'INCOME'  THEN t.amount ELSE 0 END),
            SUM(CASE WHEN t.type = 'EXPENSE' THEN t.amount ELSE 0 END)
        )
        FROM Transaction t
        WHERE t.user.id = :userId
          AND t.transactionDate >= :from
        GROUP BY YEAR(t.transactionDate), MONTH(t.transactionDate)
        ORDER BY YEAR(t.transactionDate), MONTH(t.transactionDate)
        """)
    List<MonthlyTrendDTO> getMonthlyTrend(
        @Param("userId") Long userId,
        @Param("from") LocalDate from
    );

    // ── Export: all for user within range ────────────────────────────────────

    @Query("""
        SELECT t FROM Transaction t
        LEFT JOIN FETCH t.category
        WHERE t.user.id = :userId
          AND t.transactionDate BETWEEN :from AND :to
        ORDER BY t.transactionDate DESC
        """)
    List<Transaction> findAllForExport(
        @Param("userId") Long userId,
        @Param("from") LocalDate from,
        @Param("to") LocalDate to
    );
}
