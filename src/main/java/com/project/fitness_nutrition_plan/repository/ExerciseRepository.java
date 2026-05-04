package com.project.fitness_nutrition_plan.repository;

import com.project.fitness_nutrition_plan.model.Exercise;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ExerciseRepository extends JpaRepository<Exercise, Long> {



    List<Exercise> findByWorkoutDayId(Long id);
}
