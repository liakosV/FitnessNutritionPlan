package com.project.fitness_nutrition_plan.authentication;

import com.project.fitness_nutrition_plan.model.User;

public record RefreshTokenRotation(
        User user,
        String refreshToken
) {
}
