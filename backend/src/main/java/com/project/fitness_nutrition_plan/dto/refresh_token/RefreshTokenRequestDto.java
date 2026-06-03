package com.project.fitness_nutrition_plan.dto.refresh_token;

import jakarta.validation.constraints.NotNull;

public record RefreshTokenRequestDto(
        @NotNull String refreshToken
) {
}
