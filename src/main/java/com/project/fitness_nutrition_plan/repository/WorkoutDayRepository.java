package com.project.fitness_nutrition_plan.repository;

import com.project.fitness_nutrition_plan.model.WorkoutDay;
import com.project.fitness_nutrition_plan.model.WorkoutProgram;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WorkoutDayRepository extends JpaRepository<WorkoutDay, Long> {

    Optional<WorkoutDay> findByUuid(String uuid);

    List<WorkoutDay> findByWorkoutProgram(WorkoutProgram workoutProgram);
}
