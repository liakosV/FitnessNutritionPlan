package com.project.fitness_nutrition_plan.repository;

import com.project.fitness_nutrition_plan.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    Optional<User> findByUuid(String uuid);
    List<User> findByUuidNotOrderByUsernameAsc(String uuid);

    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
}
