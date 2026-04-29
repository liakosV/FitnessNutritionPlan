package com.project.fitness_nutrition_plan;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class FitnessNutritionPlanApplication {

	public static void main(String[] args) {
		SpringApplication.run(FitnessNutritionPlanApplication.class, args);
	}

}
