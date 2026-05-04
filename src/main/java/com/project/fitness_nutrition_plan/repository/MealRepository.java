package com.project.fitness_nutrition_plan.repository;

import com.project.fitness_nutrition_plan.model.Meal;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MealRepository extends JpaRepository<Meal, Long> {

    List<Meal> findByNutritionPlanId(Long nutritionPlanId);
}
