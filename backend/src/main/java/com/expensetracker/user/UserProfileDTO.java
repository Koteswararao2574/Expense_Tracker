package com.expensetracker.user;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Data;

// ── UserProfileDTO ────────────────────────────────────────────────────────────
@Data
@Builder
public class UserProfileDTO {
    private Long id;
    private String fullName;
    private String email;
    private String preferredCurrency;
    private String role;

    static UserProfileDTO from(User u) {
        return UserProfileDTO.builder()
            .id(u.getId())
            .fullName(u.getFullName())
            .email(u.getEmail())
            .preferredCurrency(u.getPreferredCurrency())
            .role(u.getRole().name())
            .build();
    }
}

// ── UpdateProfileRequest ──────────────────────────────────────────────────────
@Data
class UpdateProfileRequest {
    @Size(min = 2, max = 100)
    private String fullName;

    @Size(max = 10)
    private String preferredCurrency;
}

// ── ChangePasswordRequest ─────────────────────────────────────────────────────
@Data
class ChangePasswordRequest {
    @NotBlank
    private String currentPassword;

    @NotBlank
    @Size(min = 8)
    private String newPassword;

    @NotBlank
    private String confirmPassword;
}
