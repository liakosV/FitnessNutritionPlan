package com.project.fitness_nutrition_plan.dto.exercise;

import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExerciseUpdateDto {

    private String name;

    @Min(value = 1, message = "Sets must be at least 1")
    private Integer sets;

    @Min(value = 1, message = "Reps must be at least 1")
    private Integer reps;

    @Min(value = 1, message = "Rest time must be at least 1")
    private Integer restTime;


    private Long workoutDayId;
}
