package com.expensetracker.currency;

import com.expensetracker.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class CurrencyService {

    private final CurrencyRepository currencyRepository;

    @Transactional(readOnly = true)
    public List<Currency> getAllCurrencies() {
        return currencyRepository.findAllByOrderByCodeAsc();
    }

    /**
     * Convert an amount from one currency to another.
     * Both currencies must exist in the DB with up-to-date rates relative to USD base.
     *
     * Formula: amountInTarget = amount * (targetRate / sourceRate)
     */
    @Transactional(readOnly = true)
    public BigDecimal convert(BigDecimal amount, String fromCode, String toCode) {
        if (fromCode.equalsIgnoreCase(toCode)) return amount;

        Currency from = currencyRepository.findById(fromCode.toUpperCase())
            .orElseThrow(() -> new ResourceNotFoundException("Currency not found: " + fromCode));
        Currency to = currencyRepository.findById(toCode.toUpperCase())
            .orElseThrow(() -> new ResourceNotFoundException("Currency not found: " + toCode));

        // Convert: amount (fromCurrency) → USD → toCurrency
        BigDecimal amountInUsd = amount.divide(from.getRateToBase(), 10, RoundingMode.HALF_UP);
        return amountInUsd.multiply(to.getRateToBase()).setScale(2, RoundingMode.HALF_UP);
    }

    /**
     * Seed default currencies into DB if empty.
     * Call from a @PostConstruct or ApplicationRunner in production.
     */
    @Transactional
    public void seedDefaultCurrencies() {
        if (currencyRepository.count() > 0) return;

        List<Currency> defaults = List.of(
            Currency.builder().code("USD").name("US Dollar").symbol("$").rateToBase(BigDecimal.ONE)
                .rateUpdatedAt(java.time.LocalDateTime.now()).build(),
            Currency.builder().code("EUR").name("Euro").symbol("€").rateToBase(new BigDecimal("0.92"))
                .rateUpdatedAt(java.time.LocalDateTime.now()).build(),
            Currency.builder().code("GBP").name("British Pound").symbol("£").rateToBase(new BigDecimal("0.79"))
                .rateUpdatedAt(java.time.LocalDateTime.now()).build(),
            Currency.builder().code("INR").name("Indian Rupee").symbol("₹").rateToBase(new BigDecimal("83.50"))
                .rateUpdatedAt(java.time.LocalDateTime.now()).build(),
            Currency.builder().code("JPY").name("Japanese Yen").symbol("¥").rateToBase(new BigDecimal("157.20"))
                .rateUpdatedAt(java.time.LocalDateTime.now()).build(),
            Currency.builder().code("CAD").name("Canadian Dollar").symbol("CA$").rateToBase(new BigDecimal("1.36"))
                .rateUpdatedAt(java.time.LocalDateTime.now()).build(),
            Currency.builder().code("AUD").name("Australian Dollar").symbol("A$").rateToBase(new BigDecimal("1.50"))
                .rateUpdatedAt(java.time.LocalDateTime.now()).build()
        );

        currencyRepository.saveAll(defaults);
        log.info("Seeded {} default currencies", defaults.size());
    }
}
