package com.project.fitness_nutrition_plan.dto.nutrition_plan;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NutritionPlanReadDto {

//    private Long id;
    private String uuid;

    private String title;
    private String description;
    private boolean active;

    private String coachUuid;
    private String coachUsername;

    private String assignedUserUuid;
    private String assignedUserUsername;
}
