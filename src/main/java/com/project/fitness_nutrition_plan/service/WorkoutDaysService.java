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
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class WorkoutDaysService {

    private final WorkoutDayRepository workoutDayRepository;
    private final WorkoutProgramRepository workoutProgramRepository;
    private final WorkoutDayMapper workoutDayMapper;

    public WorkoutDayReadDto createWorkoutDay(WorkoutDayInsertDto insertDto) {
        WorkoutProgram workoutProgram = workoutProgramRepository.findByUuid(insertDto.getWorkoutProgramUuid())
                .orElseThrow(() -> new AppObjectNotFoundException("WORKOUT_PROGRAM", "Workout program not found"));

        WorkoutDay workoutDay = workoutDayMapper.mapToWorkoutDay(insertDto, workoutProgram);
        WorkoutDay savedWorkoutDay = workoutDayRepository.save(workoutDay);

        return workoutDayMapper.mapToWorkoutDayReadDto(savedWorkoutDay);
    }

    public WorkoutDayReadDto updateWorkoutDay(WorkoutDayUpdateDto updateDto, String workoutDayUuid) {
        WorkoutDay workoutDay = getWorkoutDayByUuid(workoutDayUuid);

        workoutDayMapper.updateWorkoutDayFromDto(updateDto, workoutDay);
        return workoutDayMapper.mapToWorkoutDayReadDto(workoutDay);
    }

    public List<WorkoutDayReadDto> getWorkoutDaysByWorkoutProgram(String workoutProgramUuid) {
        WorkoutProgram workoutProgram = workoutProgramRepository.findByUuid(workoutProgramUuid)
                .orElseThrow(() -> new AppObjectNotFoundException("WORKOUT_PROGRAM", "Workout program not found"));

                return workoutDayRepository.findByWorkoutProgramUuid(workoutProgram.getUuid())
                .stream()
                .map(workoutDayMapper::mapToWorkoutDayReadDto)
                .toList();
    }

    public ResponseMessageDto deleteWorkoutDay(String workoutDayUuid) {
        WorkoutDay workoutDay = getWorkoutDayByUuid(workoutDayUuid);

        workoutDayRepository.delete(workoutDay);

        return new ResponseMessageDto("WORKOUT_DAY_DELETED", "Workout day deleted successfully");
    }

    private WorkoutDay getWorkoutDayByUuid(String workoutDayUuid) {
        return workoutDayRepository.findByUuid(workoutDayUuid)
                .orElseThrow(() -> new AppObjectNotFoundException("WORKOUT_DAY", "Workout day not found"));
    }
}
