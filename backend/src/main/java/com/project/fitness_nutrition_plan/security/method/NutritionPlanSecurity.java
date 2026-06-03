package com.project.fitness_nutrition_plan.security.method;

import com.project.fitness_nutrition_plan.model.NutritionPlan;
import com.project.fitness_nutrition_plan.repository.NutritionPlanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
public class NutritionPlanSecurity {

    private final NutritionPlanRepository nutritionPlanRepository;

    @Transactional(readOnly = true)
    public boolean isCoachOwner(String nutritionPlanUuid, String userUuid) {
        return nutritionPlanRepository.findByUuid(nutritionPlanUuid)
                .map(nutritionPlan -> isCoachOwner(nutritionPlan, userUuid))
                .orElse(false);
    }

    @Transactional(readOnly = true)
    public boolean canAccessNutritionPlan(String nutritionPlanUuid, String userUuid) {
        return nutritionPlanRepository.findByUuid(nutritionPlanUuid)
                .map(nutritionPlan -> isCoachOwner(nutritionPlan, userUuid)
                        || isAssignedUser(nutritionPlan, userUuid))
                .orElse(false);
    }

    private boolean isCoachOwner(NutritionPlan nutritionPlan, String userUuid) {
        return userUuid != null
                && nutritionPlan.getCoach() != null
                && userUuid.equals(nutritionPlan.getCoach().getUuid());
    }

    private boolean isAssignedUser(NutritionPlan nutritionPlan, String userUuid) {
        return userUuid != null
                && nutritionPlan.getAssignedUser() != null
                && userUuid.equals(nutritionPlan.getAssignedUser().getUuid());
    }
}
