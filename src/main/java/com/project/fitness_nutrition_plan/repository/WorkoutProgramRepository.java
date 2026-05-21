package com.project.fitness_nutrition_plan.repository;

import com.project.fitness_nutrition_plan.model.WorkoutProgram;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WorkoutProgramRepository extends JpaRepository<WorkoutProgram, Long> {

    Optional<WorkoutProgram> findByName(String name);

    Optional<WorkoutProgram> findByUuid(String uuid);

    List<WorkoutProgram> findByCoachUuid(String coachUuid);

    boolean existsByName(String name);
}
