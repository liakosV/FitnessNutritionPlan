package com.project.fitness_nutrition_plan.dto.workout_day;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WorkoutDayReadDto {
//    private Long id;
    private String uuid;

    private String dayName;

    private String workoutProgramUuid;
    private String workoutProgramName;
}
