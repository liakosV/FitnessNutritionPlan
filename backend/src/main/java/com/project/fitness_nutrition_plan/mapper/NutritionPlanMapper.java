package com.project.fitness_nutrition_plan.mapper;

import com.project.fitness_nutrition_plan.dto.nutrition_plan.NutritionPlanInsertDto;
import com.project.fitness_nutrition_plan.dto.nutrition_plan.NutritionPlanReadDto;
import com.project.fitness_nutrition_plan.dto.nutrition_plan.NutritionPlanUpdateDto;
import com.project.fitness_nutrition_plan.model.NutritionPlan;
import com.project.fitness_nutrition_plan.model.User;
import org.mapstruct.*;

/**
 * Mapper interface for converting NutritionPlan-related entities and DTOs.
 */
@Mapper(componentModel = "spring")
public interface NutritionPlanMapper {

    /**
     * Maps a NutritionPlan entity to a NutritionPlanReadDto object.
     *
     * @param nutritionPlan the NutritionPlan entity to be mapped
     * @return a NutritionPlanReadDto containing the mapped data from the given NutritionPlan
     */
    @Mapping(target = "coachUuid", source = "coach.uuid")
    @Mapping(target = "coachUsername", source = "coach.username")
    @Mapping(target = "assignedUserUuid", source = "assignedUser.uuid")
    @Mapping(target = "assignedUserUsername", source = "assignedUser.username")
    NutritionPlanReadDto mapToNutritionPlanReadDto(NutritionPlan nutritionPlan);

    /**
     * Maps a NutritionPlanInsertDto object and User entities to a new NutritionPlan entity.
     * Transfers data from the DTO and associates the provided coach and assigned user with the NutritionPlan.
     *
     * @param dto the NutritionPlanInsertDto containing details such as title, description, and active status
     * @param coach the User entity representing the coach to be associated with the NutritionPlan
     * @param assignedUser the User entity representing the assigned user to be linked with the NutritionPlan
     * @return a new NutritionPlan entity populated with data from the provided DTO and associated users
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "uuid", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "coach", source = "coach")
    @Mapping(target = "assignedUser", source = "assignedUser")
    NutritionPlan mapToNutritionPlan(
            NutritionPlanInsertDto dto,
            User coach,
            User assignedUser);

    /**
     * Updates the fields of an existing NutritionPlan entity with data from the provided NutritionPlanUpdateDto,
     * ignoring any null properties within the DTO.
     *
     * @param dto the NutritionPlanUpdateDto containing updated data for the nutrition plan
     * @param nutritionPlan the existing NutritionPlan entity to be updated
     */
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "uuid", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "coach", ignore = true)
    @Mapping(target = "assignedUser", ignore = true)
    void updateNutritionPlanFromDto(
            NutritionPlanUpdateDto dto,
            @MappingTarget NutritionPlan nutritionPlan
            );
}
