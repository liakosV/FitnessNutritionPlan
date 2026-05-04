package com.project.fitness_nutrition_plan.repository;

import com.project.fitness_nutrition_plan.model.ProgressEntry;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProgressEntryRepository extends JpaRepository<ProgressEntry, Long> {

    List<ProgressEntry> findByUserIdOrderByDateDesc(Long userId);
}
