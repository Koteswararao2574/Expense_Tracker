package com.expensetracker.currency;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "currencies")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Currency {

    @Id
    @Column(length = 10)
    private String code;     // ISO 4217, e.g. "USD", "EUR", "INR"

    @Column(nullable = false, length = 60)
    private String name;     // e.g. "US Dollar"

    @Column(nullable = false, length = 5)
    private String symbol;   // e.g. "$", "€", "₹"

    // Rate relative to base currency (USD).
    // 1 USD = rateToBase of that currency
    @Column(nullable = false, precision = 18, scale = 8)
    @Builder.Default
    private BigDecimal rateToBase = BigDecimal.ONE;

    @Column(nullable = false)
    private LocalDateTime rateUpdatedAt;
}
