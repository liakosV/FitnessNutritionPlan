package com.project.fitness_nutrition_plan.repository;

import com.project.fitness_nutrition_plan.model.WorkoutProgram;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WorkoutProgramRepository extends JpaRepository<WorkoutProgram, Long> {

    List<WorkoutProgram> findByCoachId(Long coachId);
}
