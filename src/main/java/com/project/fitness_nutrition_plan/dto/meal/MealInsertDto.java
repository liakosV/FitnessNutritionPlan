package com.project.fitness_nutrition_plan.dto.meal;

import jakarta.validation.constraints.Min;
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
    @Min(value = 0, message = "Calories cannot be below zero")
    private Integer calories;

    @NotNull(message = "Protein cannot be empty")
    @Min(value = 0, message = "Protein must be at least 0")
    private Double protein;

    @NotNull(message = "Carbs cannot be empty")
    @Min(value = 0, message = "Carbs must be at least 0")
    private Double carbs;

    @NotNull(message = "Fats cannot be empty")
    @Min(value = 0, message = "Fats must be at least 0")
    private Double fat;
}
