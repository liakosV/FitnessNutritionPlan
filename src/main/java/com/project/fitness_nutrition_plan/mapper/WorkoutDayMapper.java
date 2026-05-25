package com.project.fitness_nutrition_plan.mapper;

import com.project.fitness_nutrition_plan.dto.workout_day.WorkoutDayInsertDto;
import com.project.fitness_nutrition_plan.dto.workout_day.WorkoutDayReadDto;
import com.project.fitness_nutrition_plan.dto.workout_day.WorkoutDayUpdateDto;
import com.project.fitness_nutrition_plan.model.WorkoutDay;
import com.project.fitness_nutrition_plan.model.WorkoutProgram;
import org.mapstruct.*;

/**
 * Mapper interface for converting WorkoutDay-related entities and DTOs.
 */
@Mapper(componentModel = "spring")
public interface WorkoutDayMapper {

    /**
     * Maps a WorkoutDay entity to a WorkoutDayReadDto.
     *
     * @param workoutDay the WorkoutDay entity to be mapped
     * @return a WorkoutDayReadDto containing data from the provided WorkoutDay entity
     */
    @Mapping(target = "workoutProgramId", source = "workoutProgram.id")
    @Mapping(target = "workoutProgramName", source = "workoutProgram.name")
    WorkoutDayReadDto mapToWorkoutDayReadDto(WorkoutDay workoutDay);

    /**
     * Maps a WorkoutDayInsertDto and a WorkoutProgram entity to a new WorkoutDay entity.
     * The method transfers data from the provided DTO and associates the specified WorkoutProgram.
     *
     * @param dto the WorkoutDayInsertDto containing details for the workout day, such as the day name
     * @param workoutProgram the WorkoutProgram entity to be associated with the mapped WorkoutDay
     * @return a new WorkoutDay entity populated with the data from the DTO and the associated WorkoutProgram
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "uuid", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "workoutProgram", source = "workoutProgram")
    WorkoutDay mapToWorkoutDay(WorkoutDayInsertDto dto, WorkoutProgram workoutProgram);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "uuid", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "workoutProgram", ignore = true)
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateWorkoutDayFromDto(WorkoutDayUpdateDto dto, @MappingTarget WorkoutDay workoutDay);
}
