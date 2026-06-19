package com.expensetracker.auth.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AuthResponse {
    private String accessToken;
    private String refreshToken;
    private long expiresIn;         // seconds
    private String tokenType;       // "Bearer"
    private UserSummary user;

    @Data
    @Builder
    public static class UserSummary {
        private Long id;
        private String fullName;
        private String email;
        private String preferredCurrency;
    }
}
