package com.project.fitness_nutrition_plan.runner;

import com.project.fitness_nutrition_plan.model.User;
import com.project.fitness_nutrition_plan.model.static_data.Role;
import com.project.fitness_nutrition_plan.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AdminSeederRunner implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;


    @Override
    public void run(String... args) throws Exception {
        String username = "admin";

        if (userRepository.existsByUsername(username)) {
            return;
        }

        User admin = new User();
        admin.setUsername(username);
        admin.setEmail("admin@example.com");
        admin.setPassword(passwordEncoder.encode("!Password1"));
        admin.setRole(Role.ROLE_ADMIN);

        userRepository.save(admin);
    }
}
