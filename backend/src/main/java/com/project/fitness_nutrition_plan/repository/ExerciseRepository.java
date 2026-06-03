package com.project.fitness_nutrition_plan.repository;

import com.project.fitness_nutrition_plan.model.Exercise;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ExerciseRepository extends JpaRepository<Exercise, Long> {

    Optional<Exercise> findByUuid(String uuid);

    List<Exercise> findByWorkoutDayUuid(String uuid);
}
