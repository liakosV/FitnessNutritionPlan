package com.project.fitness_nutrition_plan.dto.authentication;

import jakarta.validation.constraints.NotNull;

public record AuthenticationRequestDto(@NotNull String username, @NotNull String password) {
}
