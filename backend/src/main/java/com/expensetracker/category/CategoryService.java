package com.expensetracker.category;

import java.util.List;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.expensetracker.user.User;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    @Transactional(readOnly = true)
    public List<CategoryResponseDTO> getAllForCurrentUser() {
        Long userId = currentUserId();
        return categoryRepository.findAllForUser(userId)
            .stream()
            .map(CategoryResponseDTO::from)
            .toList();
    }

    @Transactional
    public CategoryResponseDTO create(CategoryRequestDTO dto) {
        User user = getCurrentUser();
        Category category = Category.builder()
            .user(user)
            .name(dto.getName())
            .color(dto.getColor())
            .icon(dto.getIcon())
            .isSystem(false)
            .build();
        return CategoryResponseDTO.from(categoryRepository.save(category));
    }

    @Transactional
    public void delete(Long id) {
        Long userId = currentUserId();
        Category cat = categoryRepository.findById(id)
            .filter(c -> !c.isSystem())
            .filter(c -> c.getUser() != null && c.getUser().getId().equals(userId))
            .orElseThrow(() -> new com.expensetracker.shared.exception
                .ResourceNotFoundException("Category", id));
        categoryRepository.delete(cat);
    }

    private Long currentUserId() {
        return getCurrentUser().getId();
    }

    private User getCurrentUser() {
        return (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }
}
