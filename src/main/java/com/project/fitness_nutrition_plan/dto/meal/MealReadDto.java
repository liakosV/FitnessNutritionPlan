package com.project.fitness_nutrition_plan.dto.meal;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MealReadDto {
    
//    private Long id;

    private String uuid;
    
    private String name;

    private Integer calories;

    private Double protein;

    private Double carbs;

    private Double fat;

    private Long nutritionPlanId;

}
