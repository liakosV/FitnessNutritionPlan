package com.project.fitness_nutrition_plan.service;

import com.project.fitness_nutrition_plan.core.exception.AppObjectNotFoundException;
import com.project.fitness_nutrition_plan.dto.meal.MealInsertDto;
import com.project.fitness_nutrition_plan.dto.meal.MealReadDto;
import com.project.fitness_nutrition_plan.dto.meal.MealUpdateDto;
import com.project.fitness_nutrition_plan.dto.response.ResponseMessageDto;
import com.project.fitness_nutrition_plan.mapper.MealMapper;
import com.project.fitness_nutrition_plan.model.Meal;
import com.project.fitness_nutrition_plan.model.NutritionPlan;
import com.project.fitness_nutrition_plan.repository.MealRepository;
import com.project.fitness_nutrition_plan.repository.NutritionPlanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MealService {

    private final MealRepository mealRepository;
    private final NutritionPlanRepository nutritionPlanRepository;
    private final MealMapper mealMapper;

    @Transactional
    public MealReadDto createMeal(MealInsertDto insertDto, String nutritionPlanUuid) {

        NutritionPlan nutritionPlan = nutritionPlanRepository.findByUuid(nutritionPlanUuid)
                .orElseThrow(() -> new AppObjectNotFoundException("NUTRITION_PLAN", "Nutrition plan not found"));

        Meal meal = mealMapper.mapToMeal(insertDto, nutritionPlan);

        Meal savedMeal = mealRepository.save(meal);

        return mealMapper.mapToMealReadDto(savedMeal);
    }

    @Transactional
    public MealReadDto updateMeal(MealUpdateDto updateDto, String mealUuid) {
        Meal meal = mealRepository.findByUuid(mealUuid)
                .orElseThrow(() -> new AppObjectNotFoundException("MEAL", "Meal not found"));

        mealMapper.updateMealFromDto(updateDto, meal);

        return mealMapper.mapToMealReadDto(meal);
    }

    @Transactional(readOnly = true)
    public MealReadDto getMealByUuid(String mealUuid) {
        return mealRepository.findByUuid(mealUuid)
                .map(mealMapper::mapToMealReadDto)
                .orElseThrow(() -> new AppObjectNotFoundException("MEAL", "Meal not found"));
    }

    @Transactional(readOnly = true)
    public List<MealReadDto> getAllMeals() {
        return mealRepository.findAll()
                .stream().map(mealMapper::mapToMealReadDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<MealReadDto> getMealsByNutritionPlanUuid(String nutritionPlanUuid) {

        if (!nutritionPlanRepository.existsByUuid(nutritionPlanUuid)) {
            throw new AppObjectNotFoundException("NUTRITION_PLAN", "Nutrition plan not found");
        }

        return mealRepository.findByNutritionPlanUuid(nutritionPlanUuid)
                .stream().map(mealMapper::mapToMealReadDto)
                .toList();
    }

    @Transactional
    public ResponseMessageDto deleteMeal(String mealUuid) {
        Meal meal = mealRepository.findByUuid(mealUuid)
                .orElseThrow(() -> new AppObjectNotFoundException("MEAL", "Meal not found"));

        mealRepository.delete(meal);

        return new ResponseMessageDto("MEAL_DELETED", "Meal deleted successfully");
    }
}
