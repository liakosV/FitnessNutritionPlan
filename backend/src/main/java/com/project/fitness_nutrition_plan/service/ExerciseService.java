package com.project.fitness_nutrition_plan.service;

import com.project.fitness_nutrition_plan.core.exception.AppObjectNotFoundException;
import com.project.fitness_nutrition_plan.dto.exercise.ExerciseInsertDto;
import com.project.fitness_nutrition_plan.dto.exercise.ExerciseReadDto;
import com.project.fitness_nutrition_plan.dto.exercise.ExerciseUpdateDto;
import com.project.fitness_nutrition_plan.dto.response.ResponseMessageDto;
import com.project.fitness_nutrition_plan.mapper.ExerciseMapper;
import com.project.fitness_nutrition_plan.model.Exercise;
import com.project.fitness_nutrition_plan.model.WorkoutDay;
import com.project.fitness_nutrition_plan.repository.ExerciseRepository;
import com.project.fitness_nutrition_plan.repository.WorkoutDayRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service class responsible for handling CRUD operations related to exercises
 * and managing their association with workout days.
 */
@Service
@RequiredArgsConstructor
public class ExerciseService {

    private final ExerciseRepository exerciseRepository;
    private final WorkoutDayRepository workoutDayRepository;
    private final ExerciseMapper exerciseMapper;

    /**
     * Creates a new exercise and associates it with the specified workout day.
     *
     * @param insertDto the data transfer object containing information for creating the exercise
     * @param workoutDayUuid the unique identifier of the workout day with which the exercise is associated
     * @return the read data transfer object representing the created exercise
     */
    @PreAuthorize("hasAuthority('ROLE_ADMIN') or @workoutDaySecurity.isCoachOwner(#workoutDayUuid, principal.uuid)")
    @Transactional
    public ExerciseReadDto createExercise(ExerciseInsertDto insertDto, String workoutDayUuid) {
        WorkoutDay workoutDay = workoutDayRepository.findByUuid(workoutDayUuid)
                .orElseThrow(() -> new AppObjectNotFoundException("WORKOUT_DAY", "workout day not found"));

        Exercise exercise = exerciseMapper.mapToExercise(insertDto, workoutDay);
        Exercise savedExercise = exerciseRepository.save(exercise);

        return exerciseMapper.mapToExerciseReadDto(savedExercise);
    }

    /**
     * Updates an existing exercise with the given update information.
     *
     * @param updateDto the data transfer object containing updated exercise details
     * @param exerciseUuid the unique identifier of the exercise to be updated
     * @return the updated exercise represented as a data transfer object
     */
    @PreAuthorize("hasAuthority('ROLE_ADMIN') or @exerciseSecurity.isCoachOwner(#exerciseUuid, principal.uuid)")
    @Transactional
    public ExerciseReadDto updateExercise(ExerciseUpdateDto updateDto, String exerciseUuid) {
        Exercise exercise = getExerciseByUuid(exerciseUuid);

        exerciseMapper.updateExerciseFromDto(updateDto, exercise);
        return exerciseMapper.mapToExerciseReadDto(exercise);
    }

    /**
     * Retrieves a list of exercises associated with a specific workout day.
     *
     * @param workoutDayUuid the unique identifier of the workout day
     * @return a list of ExerciseReadDto objects representing the exercises for the given workout day
     * @throws AppObjectNotFoundException if the workout day with the specified UUID does not exist
     */
    @PreAuthorize("hasAuthority('ROLE_ADMIN') or @workoutDaySecurity.canAccessWorkoutDay(#workoutDayUuid, principal.uuid)")
    @Transactional(readOnly = true)
    public List<ExerciseReadDto> getExerciseByWorkoutDay(String workoutDayUuid) {
        WorkoutDay workoutDay = workoutDayRepository.findByUuid(workoutDayUuid)
                .orElseThrow(() -> new AppObjectNotFoundException("WORKOUT_DAY", "Workout day not found"));

        return exerciseRepository.findByWorkoutDayUuid(workoutDay.getUuid())
                .stream()
                .map(exerciseMapper::mapToExerciseReadDto)
                .toList();
    }

    /**
     * Deletes an exercise identified by its UUID.
     *
     * @param exerciseUuid the unique identifier of the exercise to delete
     * @return a response message indicating the successful deletion of the exercise
     */
    @PreAuthorize("hasAuthority('ROLE_ADMIN') or @exerciseSecurity.isCoachOwner(#exerciseUuid, principal.uuid)")
    @Transactional
    public ResponseMessageDto deleteExercise(String exerciseUuid) {
        Exercise exercise = getExerciseByUuid(exerciseUuid);

        exerciseRepository.delete(exercise);

        return new ResponseMessageDto("EXERCISE_DELETED", "Exercise deleted successfully");
    }

    /**
     * Retrieves an Exercise entity using its UUID.
     *
     * @param exerciseUuid the UUID of the Exercise to be retrieved
     * @return the Exercise entity associated with the given UUID
     * @throws AppObjectNotFoundException if no Exercise is found for the given UUID
     */
    private Exercise getExerciseByUuid(String exerciseUuid) {
        return exerciseRepository.findByUuid(exerciseUuid)
                .orElseThrow(() -> new AppObjectNotFoundException("EXERCISE", "Exercise not found"));
    }
}
