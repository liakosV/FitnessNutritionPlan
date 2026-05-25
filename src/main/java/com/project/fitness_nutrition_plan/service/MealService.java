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
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service class for managing Meal entities and related operations.
 */
@Service
@RequiredArgsConstructor
public class MealService {

    private final MealRepository mealRepository;
    private final NutritionPlanRepository nutritionPlanRepository;
    private final MealMapper mealMapper;

    /**
     * Creates a new meal and associates it with an existing nutrition plan.
     *
     * @param insertDto the data transfer object containing details of the meal to be created, including name, calories, macronutrients, and the nutrition plan ID
     * @param nutritionPlanUuid the UUID of the nutrition plan to associate the new meal with
     * @return a MealReadDto containing the details of the newly created meal
     * @throws AppObjectNotFoundException if the specified nutrition plan is not found
     */
    @PreAuthorize("hasAuthority('ROLE_ADMIN') or @nutritionPlanSecurity.isCoachOwner(#nutritionPlanUuid, principal.uuid)")
    @Transactional
    public MealReadDto createMeal(MealInsertDto insertDto, String nutritionPlanUuid) {

        NutritionPlan nutritionPlan = nutritionPlanRepository.findByUuid(nutritionPlanUuid)
                .orElseThrow(() -> new AppObjectNotFoundException("NUTRITION_PLAN", "Nutrition plan not found"));

        Meal meal = mealMapper.mapToMeal(insertDto, nutritionPlan);

        Meal savedMeal = mealRepository.save(meal);

        return mealMapper.mapToMealReadDto(savedMeal);
    }

    /**
     * Updates an existing meal with the data provided in the MealUpdateDto and returns the updated meal as a MealReadDto.
     *
     * @param updateDto the object containing the updated meal data
     * @param mealUuid the unique identifier of the meal to be updated
     * @return a MealReadDto representing the updated meal
     * @throws AppObjectNotFoundException if the meal with the given UUID is not found
     */
    @PreAuthorize("hasAuthority('ROLE_ADMIN') or @mealSecurity.isCoachOwner(#mealUuid, principal.uuid)")
    @Transactional
    public MealReadDto updateMeal(MealUpdateDto updateDto, String mealUuid) {
        Meal meal = mealRepository.findByUuid(mealUuid)
                .orElseThrow(() -> new AppObjectNotFoundException("MEAL", "Meal not found"));

        mealMapper.updateMealFromDto(updateDto, meal);

        return mealMapper.mapToMealReadDto(meal);
    }

    /**
     * Retrieves a meal by its unique identifier (UUID). Only accessible by users with proper authorization.
     *
     * @param mealUuid the UUID of the meal to retrieve
     * @return a MealReadDto representing the meal data
     * @throws AppObjectNotFoundException if the meal with the specified UUID is not found
     */
    @PreAuthorize("hasAuthority('ROLE_ADMIN') or @mealSecurity.canAccessMeal(#mealUuid, principal.uuid)")
    @Transactional(readOnly = true)
    public MealReadDto getMealByUuid(String mealUuid) {
        return mealRepository.findByUuid(mealUuid)
                .map(mealMapper::mapToMealReadDto)
                .orElseThrow(() -> new AppObjectNotFoundException("MEAL", "Meal not found"));
    }

    /**
     * Retrieves all meals from the repository and maps them to MealReadDto objects.
     *
     * @return a list of MealReadDto objects representing the meals
     */
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @Transactional(readOnly = true)
    public List<MealReadDto> getAllMeals() {
        return mealRepository.findAll()
                .stream().map(mealMapper::mapToMealReadDto)
                .toList();
    }

    /**
     * Retrieves a list of meals associated with a specified nutrition plan UUID.
     * Ensures the requesting user has appropriate permissions to access the nutrition plan.
     *
     * @param nutritionPlanUuid the UUID of the nutrition plan whose associated meals are to be retrieved
     * @return a list of MealReadDto containing details of the meals associated with the specified nutrition plan
     * @throws AppObjectNotFoundException if the nutrition plan with the specified UUID is not found
     */
    @PreAuthorize("hasAuthority('ROLE_ADMIN') or @nutritionPlanSecurity.canAccessNutritionPlan(#nutritionPlanUuid, principal.uuid)")
    @Transactional(readOnly = true)
    public List<MealReadDto> getMealsByNutritionPlanUuid(String nutritionPlanUuid) {

        if (!nutritionPlanRepository.existsByUuid(nutritionPlanUuid)) {
            throw new AppObjectNotFoundException("NUTRITION_PLAN", "Nutrition plan not found");
        }

        return mealRepository.findByNutritionPlanUuid(nutritionPlanUuid)
                .stream().map(mealMapper::mapToMealReadDto)
                .toList();
    }

    /**
     * Deletes a meal identified by the given UUID. The method checks if the caller has sufficient
     * authorization and ensures the meal exists before performing the deletion.
     *
     * @param mealUuid the unique identifier of the meal to be deleted
     * @return a ResponseMessageDto containing a success message and code upon successful deletion
     * @throws AppObjectNotFoundException if the meal with the provided UUID does not exist
     */
    @PreAuthorize("hasAuthority('ROLE_ADMIN') or @mealSecurity.isCoachOwner(#mealUuid, principal.uuid)")
    @Transactional
    public ResponseMessageDto deleteMeal(String mealUuid) {
        Meal meal = mealRepository.findByUuid(mealUuid)
                .orElseThrow(() -> new AppObjectNotFoundException("MEAL", "Meal not found"));

        mealRepository.delete(meal);

        return new ResponseMessageDto("MEAL_DELETED", "Meal deleted successfully");
    }
}
