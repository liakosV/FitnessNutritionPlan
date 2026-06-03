package com.project.fitness_nutrition_plan.repository;

import com.project.fitness_nutrition_plan.model.RefreshToken;
import com.project.fitness_nutrition_plan.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    Optional<RefreshToken> findByToken(String token);
}
