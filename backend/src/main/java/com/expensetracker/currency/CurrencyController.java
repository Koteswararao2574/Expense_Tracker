package com.expensetracker.currency;

import com.expensetracker.shared.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/currencies")
@RequiredArgsConstructor
public class CurrencyController {

    private final CurrencyService currencyService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Currency>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(currencyService.getAllCurrencies()));
    }

    /**
     * GET /api/v1/currencies/convert?amount=100&from=USD&to=INR
     */
    @GetMapping("/convert")
    public ResponseEntity<ApiResponse<Map<String, Object>>> convert(
        @RequestParam BigDecimal amount,
        @RequestParam String from,
        @RequestParam String to
    ) {
        BigDecimal result = currencyService.convert(amount, from, to);
        return ResponseEntity.ok(ApiResponse.success(Map.of(
            "from",           from.toUpperCase(),
            "to",             to.toUpperCase(),
            "originalAmount", amount,
            "convertedAmount", result
        )));
    }
}
