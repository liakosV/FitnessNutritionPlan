package com.project.fitness_nutrition_plan.security.method;

import com.project.fitness_nutrition_plan.model.Meal;
import com.project.fitness_nutrition_plan.model.NutritionPlan;
import com.project.fitness_nutrition_plan.repository.MealRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
public class MealSecurity {

    private final MealRepository mealRepository;

    @Transactional(readOnly = true)
    public boolean isCoachOwner(String mealUuid, String userUuid) {
        return mealRepository.findByUuid(mealUuid)
                .map(meal -> isCoachOwner(meal, userUuid))
                .orElse(false);
    }

    @Transactional(readOnly = true)
    public boolean canAccessMeal(String mealUuid, String userUuid) {
        return mealRepository.findByUuid(mealUuid)
                .map(meal -> isCoachOwner(meal, userUuid) || isAssignedUser(meal, userUuid))
                .orElse(false);
    }

    private boolean isCoachOwner(Meal meal, String userUuid) {
        NutritionPlan nutritionPlan = meal.getNutritionPlan();

        return userUuid != null
                && nutritionPlan != null
                && nutritionPlan.getCoach() != null
                && userUuid.equals(nutritionPlan.getCoach().getUuid());
    }

    private boolean isAssignedUser(Meal meal, String userUuid) {
        NutritionPlan nutritionPlan = meal.getNutritionPlan();

        return userUuid != null
                && nutritionPlan != null
                && nutritionPlan.getAssignedUser() != null
                && userUuid.equals(nutritionPlan.getAssignedUser().getUuid());
    }
}
