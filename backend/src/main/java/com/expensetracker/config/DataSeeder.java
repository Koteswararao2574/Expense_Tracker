package com.expensetracker.config;

import java.util.List;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.expensetracker.category.Category;
import com.expensetracker.category.CategoryRepository;
import com.expensetracker.currency.CurrencyService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements ApplicationRunner {

    private final CategoryRepository categoryRepository;
    private final CurrencyService    currencyService;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        seedSystemCategories();
        currencyService.seedDefaultCurrencies();
    }

    private void seedSystemCategories() {
        if (categoryRepository.count() > 0) return;

        List<Category> systemCategories = List.of(
            build("Food & Dining",     "#FF6B6B", "🍔"),
            build("Transport",         "#4ECDC4", "🚗"),
            build("Shopping",          "#45B7D1", "🛍️"),
            build("Entertainment",     "#96CEB4", "🎬"),
            build("Health & Medical",  "#FFEAA7", "🏥"),
            build("Bills & Utilities", "#DDA0DD", "⚡"),
            build("Education",         "#98D8C8", "📚"),
            build("Travel",            "#F7DC6F", "✈️"),
            build("Groceries",         "#82E0AA", "🛒"),
            build("Salary",            "#76D7C4", "💼"),
            build("Freelance",         "#F8C471", "💻"),
            build("Investment",        "#85C1E9", "📈"),
            build("Other",             "#D7DBDD", "📌")
        );

        categoryRepository.saveAll(systemCategories);
        log.info("Seeded {} system categories", systemCategories.size());
    }

    private Category build(String name, String color, String icon) {
        return Category.builder()
            .name(name)
            .color(color)
            .icon(icon)
            .isSystem(true)
            .build();
    }
}
