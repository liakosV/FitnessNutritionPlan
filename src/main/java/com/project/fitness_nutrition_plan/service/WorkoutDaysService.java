package com.project.fitness_nutrition_plan.service;

import com.project.fitness_nutrition_plan.core.exception.AppObjectNotFoundException;
import com.project.fitness_nutrition_plan.dto.response.ResponseMessageDto;
import com.project.fitness_nutrition_plan.dto.workout_day.WorkoutDayInsertDto;
import com.project.fitness_nutrition_plan.dto.workout_day.WorkoutDayReadDto;
import com.project.fitness_nutrition_plan.dto.workout_day.WorkoutDayUpdateDto;
import com.project.fitness_nutrition_plan.mapper.WorkoutDayMapper;
import com.project.fitness_nutrition_plan.model.WorkoutDay;
import com.project.fitness_nutrition_plan.model.WorkoutProgram;
import com.project.fitness_nutrition_plan.repository.WorkoutDayRepository;
import com.project.fitness_nutrition_plan.repository.WorkoutProgramRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service class for managing workout days associated with workout programs.
 */
@Service
@RequiredArgsConstructor
public class WorkoutDaysService {

    private final WorkoutDayRepository workoutDayRepository;
    private final WorkoutProgramRepository workoutProgramRepository;
    private final WorkoutDayMapper workoutDayMapper;

    /**
     * Creates a new WorkoutDay and associates it with an existing WorkoutProgram.
     *
     * @param insertDto the data transfer object containing details for the new workout day,
     *                  including the day name and the UUID of the workout program to associate it with
     * @return a WorkoutDayReadDto representing the newly created WorkoutDay
     * @throws AppObjectNotFoundException if the specified workout program does not exist
     */
    @PreAuthorize("hasAuthority('ROLE_ADMIN') or @workoutProgramSecurity.isCoachOwner(#insertDto.workoutProgramUuid, principal.uuid)")
    @Transactional
    public WorkoutDayReadDto createWorkoutDay(WorkoutDayInsertDto insertDto) {
        WorkoutProgram workoutProgram = workoutProgramRepository.findByUuid(insertDto.getWorkoutProgramUuid())
                .orElseThrow(() -> new AppObjectNotFoundException("WORKOUT_PROGRAM", "Workout program not found"));

        WorkoutDay workoutDay = workoutDayMapper.mapToWorkoutDay(insertDto, workoutProgram);
        WorkoutDay savedWorkoutDay = workoutDayRepository.save(workoutDay);

        return workoutDayMapper.mapToWorkoutDayReadDto(savedWorkoutDay);
    }

    /**
     * Updates an existing workout day with the provided data.
     *
     * @param updateDto the data for updating the workout day
     * @param workoutDayUuid the unique identifier of the workout day to be updated
     * @return a WorkoutDayReadDto containing the updated workout day details
     */
    @PreAuthorize("hasAuthority('ROLE_ADMIN') or @workoutDaySecurity.isCoachOwner(#workoutDayUuid, principal.uuid)")
    @Transactional
    public WorkoutDayReadDto updateWorkoutDay(WorkoutDayUpdateDto updateDto, String workoutDayUuid) {
        WorkoutDay workoutDay = getWorkoutDayByUuid(workoutDayUuid);

        workoutDayMapper.updateWorkoutDayFromDto(updateDto, workoutDay);
        return workoutDayMapper.mapToWorkoutDayReadDto(workoutDay);
    }

    /**
     * Retrieves a list of WorkoutDayReadDto objects associated with a specified workout program.
     *
     * @param workoutProgramUuid the UUID of the workout program whose workout days are to be retrieved
     * @return a list of WorkoutDayReadDto objects representing the workout days of the specified workout program
     * @throws AppObjectNotFoundException if the workout program with the provided UUID does not exist
     */
    @PreAuthorize("hasAuthority('ROLE_ADMIN') or @workoutProgramSecurity.canAccessWorkoutProgram(#workoutProgramUuid, principal.uuid)")
    @Transactional(readOnly = true)
    public List<WorkoutDayReadDto> getWorkoutDaysByWorkoutProgram(String workoutProgramUuid) {
        WorkoutProgram workoutProgram = workoutProgramRepository.findByUuid(workoutProgramUuid)
                .orElseThrow(() -> new AppObjectNotFoundException("WORKOUT_PROGRAM", "Workout program not found"));

        return workoutDayRepository.findByWorkoutProgram(workoutProgram)
                .stream()
                .map(workoutDayMapper::mapToWorkoutDayReadDto)
                .toList();
    }

    /**
     * Deletes a workout day based on the provided UUID and returns a response message.
     *
     * @param workoutDayUuid the UUID of the workout day to be deleted
     * @return a ResponseMessageDto containing the deletion status and message
     */
    @PreAuthorize("hasAuthority('ROLE_ADMIN') or @workoutDaySecurity.isCoachOwner(#workoutDayUuid, principal.uuid)")
    @Transactional
    public ResponseMessageDto deleteWorkoutDay(String workoutDayUuid) {
        WorkoutDay workoutDay = getWorkoutDayByUuid(workoutDayUuid);

        workoutDayRepository.delete(workoutDay);

        return new ResponseMessageDto("WORKOUT_DAY_DELETED", "Workout day deleted successfully");
    }

    /**
     * Retrieves a WorkoutDay entity by its UUID.
     *
     * @param workoutDayUuid the UUID of the workout day to retrieve
     * @return the WorkoutDay entity associated with the given UUID
     * @throws AppObjectNotFoundException if a workout day with the given UUID is not found
     */
    private WorkoutDay getWorkoutDayByUuid(String workoutDayUuid) {
        return workoutDayRepository.findByUuid(workoutDayUuid)
                .orElseThrow(() -> new AppObjectNotFoundException("WORKOUT_DAY", "Workout day not found"));
    }
}
