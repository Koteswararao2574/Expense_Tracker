package com.expensetracker.recurring;

import com.expensetracker.shared.response.ApiResponse;
import com.expensetracker.user.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/recurring")
@RequiredArgsConstructor
public class RecurringController {

    private final RecurringService recurringService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<RecurringResponseDTO>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(recurringService.getAllForUser(currentUserId())));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<RecurringResponseDTO>> create(
        @Valid @RequestBody RecurringRequestDTO request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Recurring rule created",
                recurringService.create(currentUserId(), request)));
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<ApiResponse<Void>> toggle(@PathVariable Long id) {
        recurringService.toggleActive(currentUserId(), id);
        return ResponseEntity.ok(ApiResponse.success("Toggled", null));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        recurringService.delete(currentUserId(), id);
        return ResponseEntity.ok(ApiResponse.success("Deleted", null));
    }

    private Long currentUserId() {
        return ((User) SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getId();
    }
}
