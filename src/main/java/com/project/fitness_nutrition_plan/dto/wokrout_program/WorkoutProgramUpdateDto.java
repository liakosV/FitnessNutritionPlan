package com.project.fitness_nutrition_plan.dto.wokrout_program;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WorkoutProgramUpdateDto {
    private String name;
    private String description;
    private Boolean active;
}
