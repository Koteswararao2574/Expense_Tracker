package com.expensetracker.transaction;

import com.expensetracker.budget.BudgetService;
import com.expensetracker.category.CategoryRepository;
import com.expensetracker.shared.exception.BusinessRuleException;
import com.expensetracker.shared.exception.ResourceNotFoundException;
import com.expensetracker.transaction.dto.TransactionRequest;
import com.expensetracker.transaction.dto.TransactionResponse;
import com.expensetracker.user.User;
import com.expensetracker.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final BudgetService budgetService;

    @Transactional(readOnly = true)
    public Page<TransactionResponse> getAll(Pageable pageable) {
        Long userId = currentUserId();
        return transactionRepository
            .findByUserIdOrderByTransactionDateDesc(userId, pageable)
            .map(TransactionResponse::from);
    }

    @Transactional(readOnly = true)
    public TransactionResponse getById(Long id) {
        Transaction t = transactionRepository.findByIdAndUserId(id, currentUserId())
            .orElseThrow(() -> new ResourceNotFoundException("Transaction", id));
        return TransactionResponse.from(t);
    }

    @Transactional
    public TransactionResponse create(TransactionRequest request) {
        User user = userRepository.getReferenceById(currentUserId());

        Transaction transaction = Transaction.builder()
            .user(user)
            .amount(request.getAmount())
            .currency(request.getCurrency())
            .type(Transaction.TransactionType.valueOf(request.getType()))
            .transactionDate(request.getTransactionDate())
            .description(request.getDescription())
            .merchant(request.getMerchant())
            .build();

        if (request.getCategoryId() != null) {
            transaction.setCategory(
                categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category", request.getCategoryId()))
            );
        }

        Transaction saved = transactionRepository.save(transaction);

        // Trigger async budget check after saving
        if (Transaction.TransactionType.EXPENSE.name().equals(request.getType())) {
            budgetService.checkBudgetThresholds(currentUserId(), saved);
        }

        return TransactionResponse.from(saved);
    }

    @Transactional
    public TransactionResponse update(Long id, TransactionRequest request) {
        Transaction transaction = transactionRepository.findByIdAndUserId(id, currentUserId())
            .orElseThrow(() -> new ResourceNotFoundException("Transaction", id));

        transaction.setAmount(request.getAmount());
        transaction.setCurrency(request.getCurrency());
        transaction.setType(Transaction.TransactionType.valueOf(request.getType()));
        transaction.setTransactionDate(request.getTransactionDate());
        transaction.setDescription(request.getDescription());
        transaction.setMerchant(request.getMerchant());

        if (request.getCategoryId() != null) {
            transaction.setCategory(
                categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category", request.getCategoryId()))
            );
        }

        return TransactionResponse.from(transactionRepository.save(transaction));
    }

    @Transactional
    public void delete(Long id) {
        Transaction transaction = transactionRepository.findByIdAndUserId(id, currentUserId())
            .orElseThrow(() -> new ResourceNotFoundException("Transaction", id));
        transactionRepository.delete(transaction);
    }

    // ── Helper ────────────────────────────────────────────────────────────────

    private Long currentUserId() {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return user.getId();
    }
}
