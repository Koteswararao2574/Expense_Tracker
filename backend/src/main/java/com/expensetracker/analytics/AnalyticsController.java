package com.expensetracker.analytics;

import com.expensetracker.analytics.dto.CategoryBreakdownDTO;
import com.expensetracker.analytics.dto.MonthlyTrendDTO;
import com.expensetracker.shared.response.ApiResponse;
import com.expensetracker.transaction.TransactionRepository;
import com.expensetracker.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final TransactionRepository transactionRepository;

    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<List<CategoryBreakdownDTO>>> categoryBreakdown(
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
    ) {
        Long userId = currentUserId();
        List<CategoryBreakdownDTO> data = transactionRepository.getCategoryBreakdown(userId, from, to);
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @GetMapping("/trend")
    public ResponseEntity<ApiResponse<List<MonthlyTrendDTO>>> monthlyTrend(
        @RequestParam(defaultValue = "12") int months
    ) {
        Long userId = currentUserId();
        LocalDate from = LocalDate.now().minusMonths(months).withDayOfMonth(1);
        List<MonthlyTrendDTO> data = transactionRepository.getMonthlyTrend(userId, from);
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    private Long currentUserId() {
        return ((User) SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getId();
    }
}
