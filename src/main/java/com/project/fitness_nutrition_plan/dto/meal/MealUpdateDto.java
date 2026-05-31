package com.project.fitness_nutrition_plan.dto.meal;

import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MealUpdateDto {

    private String name;

    @Min(value = 0, message = "Calories must be at least 0")
    private Integer calories;

    @Min(value = 0, message = "Protein must be at least 0")
    private Double protein;

    @Min(value = 0, message = "Protein must be at least 0")
    private Double carbs;

    @Min(value = 0, message = "Protein must be at least 0")
    private Double fat;

    private Long nutritionPlanId;
}
