package com.project.fitness_nutrition_plan.repository;

import com.project.fitness_nutrition_plan.model.WorkoutDay;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WorkoutDayRepository extends JpaRepository<WorkoutDay, Long> {

    List<WorkoutDay> findByWorkoutProgramId(Long workoutProgramId);
}
