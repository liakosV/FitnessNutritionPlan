package com.project.fitness_nutrition_plan.security.method;

import com.project.fitness_nutrition_plan.model.User;
import com.project.fitness_nutrition_plan.model.WorkoutDay;
import com.project.fitness_nutrition_plan.model.WorkoutProgram;
import com.project.fitness_nutrition_plan.repository.WorkoutDayRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
public class WorkoutDaySecurity {

    private final WorkoutDayRepository workoutDayRepository;

    @Transactional(readOnly = true)
    public boolean isCoachOwner(String workoutDayUuid, String userUuid) {
        return workoutDayRepository.findByUuid(workoutDayUuid)
                .map(workoutDay -> isCoachOwner(workoutDay, userUuid))
                .orElse(false);
    }

    @Transactional(readOnly = true)
    public boolean canAccessWorkoutDay(String workoutDayUuid, String userUuid) {
        return workoutDayRepository.findByUuid(workoutDayUuid)
                .map(workoutDay -> isCoachOwner(workoutDay, userUuid)
                        || isAssignedUser(workoutDay, userUuid))
                .orElse(false);
    }

    private boolean isCoachOwner(WorkoutDay workoutDay, String userUuid) {
        WorkoutProgram workoutProgram = workoutDay.getWorkoutProgram();

        return userUuid != null
                && workoutProgram != null
                && workoutProgram.getCoach() != null
                && userUuid.equals(workoutProgram.getCoach().getUuid());
    }

    private boolean isAssignedUser(WorkoutDay workoutDay, String userUuid) {
        WorkoutProgram workoutProgram = workoutDay.getWorkoutProgram();

        return userUuid != null
                && workoutProgram != null
                && workoutProgram.getAssignedUsers() != null
                && workoutProgram.getAssignedUsers().stream()
                .map(User::getUuid)
                .anyMatch(userUuid::equals);
    }
}
