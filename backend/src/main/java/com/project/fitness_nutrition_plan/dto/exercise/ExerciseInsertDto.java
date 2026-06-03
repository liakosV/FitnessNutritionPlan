package com.project.fitness_nutrition_plan.dto.exercise;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExerciseInsertDto {

    @NotBlank(message = "Name cannot be empty")
    private String name;

    @NotNull(message = "Sets cannot be empty")
    @Min(value = 1, message = "Sets must be at least 1")
    private Integer sets;

    @NotNull(message = "Reps cannot be empty")
    @Min(value = 1, message = "Reps must be at least 1")
    private Integer reps;

    @NotNull(message = "Rest time cannot be empty")
    @Min(value = 1, message = "Rest time must be at least 1")
    private Integer restTime;
}
