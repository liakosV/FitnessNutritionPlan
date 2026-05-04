package com.project.fitness_nutrition_plan.repository;

import com.project.fitness_nutrition_plan.model.NutritionPlan;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface NutritionPlanRepository extends JpaRepository<NutritionPlan, Long> {

    List<NutritionPlan> findByCoachId(Long coachId);

    Optional<NutritionPlan> findByAssignedUserId(Long assignedUserId);

    boolean existByAssignedUserId(Long userId);
}
