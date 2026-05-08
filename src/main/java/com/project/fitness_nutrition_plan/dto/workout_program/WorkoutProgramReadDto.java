package com.project.fitness_nutrition_plan.dto.workout_program;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WorkoutProgramReadDto {

    private Long id;
    private String uuid;

    private String name;
    private String description;
    private boolean active;

    private Long coachId;
    private String coachUsername;

    private List<Long> assignedUserIds;
    private List<String> assignedUsernames;
}
