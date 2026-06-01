package com.project.fitness_nutrition_plan.dto.authentication;

public record AuthenticationResponseDto(
        String accessToken,
        String refreshToken) {
}
