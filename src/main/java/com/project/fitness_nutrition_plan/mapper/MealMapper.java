package com.project.fitness_nutrition_plan.mapper;

import com.project.fitness_nutrition_plan.dto.meal.MealInsertDto;
import com.project.fitness_nutrition_plan.dto.meal.MealReadDto;
import com.project.fitness_nutrition_plan.dto.meal.MealUpdateDto;
import com.project.fitness_nutrition_plan.model.Meal;
import com.project.fitness_nutrition_plan.model.NutritionPlan;
import org.mapstruct.*;

/**
 * Mapper interface for converting Meal-related entities and DTOs.
 */
@Mapper(componentModel = "spring")
public interface MealMapper {

    /**
     * Maps a Meal entity to a MealReadDto.
     *
     * @param meal the Meal entity to be mapped
     * @return a MealReadDto containing data from the provided Meal entity
     */
    @Mapping(target = "nutritionPlanId", source = "nutritionPlan.id")
    MealReadDto mapToMealReadDto(Meal meal);

    /**
     * Maps a MealInsertDto object and a NutritionPlan entity to a new Meal entity.
     * The method transfers data from the DTO and associates the provided NutritionPlan with the Meal.
     *
     * @param dto the MealInsertDto containing meal details such as name, calories, protein, carbs, and fats
     * @param nutritionPlan the NutritionPlan entity to be associated with the mapped Meal
     * @return a new Meal entity populated with data from the provided DTO and associated NutritionPlan
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "nutritionPlan", source = "nutritionPlan")
    Meal mapToMeal(MealInsertDto dto, NutritionPlan nutritionPlan);

    /**
     * Updates an existing Meal entity with data from a given MealUpdateDto object.
     * Only non-null fields in the DTO are used to update the Meal entity.
     *
     * @param dto the MealUpdateDto containing the updated meal data
     * @param meal the Meal entity to be updated
     */
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "nutritionPlan", ignore = true)
    void updateMealFromDto(MealUpdateDto dto, @MappingTarget Meal meal);
}
