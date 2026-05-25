package com.project.fitness_nutrition_plan.dto.workout_day;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WorkoutDayInsertDto {

    @NotBlank(message = "Day name cannot be empty")
    private String dayName;

    @NotNull(message = "Workout program uuid cannot be empty")
    private String workoutProgramUuid;
}
