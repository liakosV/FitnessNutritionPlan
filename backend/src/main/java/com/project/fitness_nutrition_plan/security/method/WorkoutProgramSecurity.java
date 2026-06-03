package com.project.fitness_nutrition_plan.security.method;

import com.project.fitness_nutrition_plan.model.User;
import com.project.fitness_nutrition_plan.model.WorkoutProgram;
import com.project.fitness_nutrition_plan.repository.WorkoutProgramRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
public class WorkoutProgramSecurity {

    private final WorkoutProgramRepository workoutProgramRepository;

    @Transactional(readOnly = true)
    public boolean isCoachOwner(String workoutProgramUuid, String userUuid) {
        return workoutProgramRepository.findByUuid(workoutProgramUuid)
                .map(workoutProgram -> isCoachOwner(workoutProgram, userUuid))
                .orElse(false);
    }

    @Transactional(readOnly = true)
    public boolean canAccessWorkoutProgram(String workoutProgramUuid, String userUuid) {
        return workoutProgramRepository.findByUuid(workoutProgramUuid)
                .map(workoutProgram -> isCoachOwner(workoutProgram, userUuid)
                        || isAssignedUser(workoutProgram, userUuid))
                .orElse(false);
    }

    private boolean isCoachOwner(WorkoutProgram workoutProgram, String userUuid) {
        return userUuid != null
                && workoutProgram.getCoach() != null
                && userUuid.equals(workoutProgram.getCoach().getUuid());
    }

    private boolean isAssignedUser(WorkoutProgram workoutProgram, String userUuid) {
        return userUuid != null
                && workoutProgram.getAssignedUsers() != null
                && workoutProgram.getAssignedUsers().stream()
                .map(User::getUuid)
                .anyMatch(userUuid::equals);
    }
}
