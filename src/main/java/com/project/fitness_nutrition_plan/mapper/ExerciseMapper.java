package com.project.fitness_nutrition_plan.mapper;

import com.project.fitness_nutrition_plan.dto.exercise.ExerciseInsertDto;
import com.project.fitness_nutrition_plan.dto.exercise.ExerciseReadDto;
import com.project.fitness_nutrition_plan.dto.exercise.ExerciseUpdateDto;
import com.project.fitness_nutrition_plan.model.Exercise;
import com.project.fitness_nutrition_plan.model.WorkoutDay;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface ExerciseMapper {

    @Mapping(target = "workoutDayId", source = "workoutDay.id")
    ExerciseReadDto mapToExerciseReadDto(Exercise exercise);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "uuid", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "workoutDay", source = "workoutDay")
    Exercise mapToExercise(ExerciseInsertDto dto, WorkoutDay workoutDay);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "uuid", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "workoutDay", ignore = true)
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateExerciseFromDto(ExerciseUpdateDto dto, @MappingTarget Exercise exercise);
}
