package com.project.fitness_nutrition_plan.security.method;

import com.project.fitness_nutrition_plan.model.Exercise;
import com.project.fitness_nutrition_plan.model.User;
import com.project.fitness_nutrition_plan.model.WorkoutDay;
import com.project.fitness_nutrition_plan.model.WorkoutProgram;
import com.project.fitness_nutrition_plan.repository.ExerciseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
public class ExerciseSecurity {

    private final ExerciseRepository exerciseRepository;

    @Transactional(readOnly = true)
    public boolean isCoachOwner(String exerciseUuid, String userUuid) {
        return exerciseRepository.findByUuid(exerciseUuid)
                .map(exercise -> isCoachOwner(exercise, userUuid))
                .orElse(false);
    }

    @Transactional(readOnly = true)
    public boolean canAccessExercise(String exerciseUuid, String userUuid) {
        return exerciseRepository.findByUuid(exerciseUuid)
                .map(exercise -> isCoachOwner(exercise, userUuid) || isAssignedUser(exercise, userUuid))
                .orElse(false);
    }

    private boolean isCoachOwner(Exercise exercise, String userUuid) {
        WorkoutProgram workoutProgram = getWorkoutProgram(exercise);

        return userUuid != null
                && workoutProgram != null
                && workoutProgram.getCoach() != null
                && userUuid.equals(workoutProgram.getCoach().getUuid());
    }

    private boolean isAssignedUser(Exercise exercise, String userUuid) {
        WorkoutProgram workoutProgram = getWorkoutProgram(exercise);

        return userUuid != null
                && workoutProgram != null
                && workoutProgram.getAssignedUsers() != null
                && workoutProgram.getAssignedUsers().stream()
                .map(User::getUuid)
                .anyMatch(userUuid::equals);
    }

    private WorkoutProgram getWorkoutProgram(Exercise exercise) {
        WorkoutDay workoutDay = exercise.getWorkoutDay();
        return workoutDay == null ? null : workoutDay.getWorkoutProgram();
    }
}
