package com.project.fitness_nutrition_plan.repository;

import com.project.fitness_nutrition_plan.model.ProgressEntry;
import com.project.fitness_nutrition_plan.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProgressEntryRepository extends JpaRepository<ProgressEntry, Long> {

    List<ProgressEntry> findByUserOrderByDateDesc(User user);

    Optional<ProgressEntry> findByUuid(String uuid);
}
