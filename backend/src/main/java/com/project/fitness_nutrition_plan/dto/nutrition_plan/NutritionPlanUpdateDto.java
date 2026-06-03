package com.project.fitness_nutrition_plan.dto.nutrition_plan;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class NutritionPlanUpdateDto {

    private String title;
    private String description;
    private Boolean active;
}
