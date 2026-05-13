package com.project.fitness_nutrition_plan.repository;

import com.project.fitness_nutrition_plan.model.Meal;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MealRepository extends JpaRepository<Meal, Long> {

    Optional<Meal> findByUuid(String uuid);

    List<Meal> findByNutritionPlanUuid(String nutritionPlanUuid);

    boolean existByUuid(String uuid);
}
