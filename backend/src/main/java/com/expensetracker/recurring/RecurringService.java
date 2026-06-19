package com.expensetracker.recurring;

import com.expensetracker.category.CategoryRepository;
import com.expensetracker.shared.exception.ResourceNotFoundException;
import com.expensetracker.transaction.Transaction;
import com.expensetracker.user.User;
import com.expensetracker.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RecurringService {

    private final RecurringRepository  recurringRepository;
    private final UserRepository       userRepository;
    private final CategoryRepository   categoryRepository;

    @Transactional(readOnly = true)
    public List<RecurringResponseDTO> getAllForUser(Long userId) {
        return recurringRepository.findByUserId(userId)
            .stream()
            .map(RecurringResponseDTO::from)
            .toList();
    }

    @Transactional
    public RecurringResponseDTO create(Long userId, RecurringRequestDTO dto) {
        User user = userRepository.getReferenceById(userId);

        RecurringTemplate template = RecurringTemplate.builder()
            .user(user)
            .name(dto.getName())
            .amount(dto.getAmount())
            .currency(dto.getCurrency())
            .type(Transaction.TransactionType.valueOf(dto.getType()))
            .frequency(RecurringTemplate.Frequency.valueOf(dto.getFrequency()))
            .startDate(dto.getStartDate())
            .endDate(dto.getEndDate())
            .nextRunDate(dto.getStartDate())   // First run on start date
            .active(true)
            .build();

        if (dto.getCategoryId() != null) {
            template.setCategory(
                categoryRepository.findById(dto.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category", dto.getCategoryId()))
            );
        }

        return RecurringResponseDTO.from(recurringRepository.save(template));
    }

    @Transactional
    public void toggleActive(Long userId, Long ruleId) {
        RecurringTemplate rule = recurringRepository.findByIdAndUserId(ruleId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Recurring rule", ruleId));
        rule.setActive(!rule.isActive());
        recurringRepository.save(rule);
    }

    @Transactional
    public void delete(Long userId, Long ruleId) {
        RecurringTemplate rule = recurringRepository.findByIdAndUserId(ruleId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Recurring rule", ruleId));
        recurringRepository.delete(rule);
    }
}
