package com.project.fitness_nutrition_plan.dto.meal;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MealInsertDto {

    @NotBlank(message = "Name cannot be empty")
    private String name;

    @NotNull(message = "Calories cannot be empty")
    private Integer calories;

    @NotNull(message = "Protein cannot be empty")
    private Double protein;

    @NotNull(message = "Carbs cannot be empty")
    private Double carbs;

    @NotNull(message = "Fats cannot be empty")
    private Double fat;

    @NotNull(message = "Nutrition plan is required")
    private Long nutritionPlanId;
}
