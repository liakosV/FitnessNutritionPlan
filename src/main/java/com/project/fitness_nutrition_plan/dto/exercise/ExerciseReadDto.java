package com.project.fitness_nutrition_plan.dto.exercise;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExerciseReadDto {

    private Long id;
    private String uuid;
    private String name;
    private Integer sets;
    private Integer reps;
    private Integer restTime;
    private Long workoutDayId;
}
