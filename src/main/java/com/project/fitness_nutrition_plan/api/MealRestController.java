package com.project.fitness_nutrition_plan.api;

import com.project.fitness_nutrition_plan.dto.meal.MealInsertDto;
import com.project.fitness_nutrition_plan.dto.meal.MealReadDto;
import com.project.fitness_nutrition_plan.dto.meal.MealUpdateDto;
import com.project.fitness_nutrition_plan.dto.response.ResponseMessageDto;
import com.project.fitness_nutrition_plan.service.MealService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class MealRestController {

    private final MealService mealService;

    @PostMapping("/nutrition-plans/{nutritionPlanUuid}/meals")
    public ResponseEntity<MealReadDto> createMeal(
            @RequestBody @Valid MealInsertDto insertDto,
            @PathVariable String nutritionPlanUuid) {
        return ResponseEntity.ok(mealService.createMeal(insertDto, nutritionPlanUuid));
    }

    @GetMapping("/nutrition-plans/{nutritionPlanUuid}/meals")
    public ResponseEntity<List<MealReadDto>> getMealsByNutritionPlanUuid(@PathVariable String nutritionPlanUuid) {
        return ResponseEntity.ok(mealService.getMealsByNutritionPlanUuid(nutritionPlanUuid));
    }

    @PatchMapping("/meals/{uuid}")
    public ResponseEntity<MealReadDto> updateMeal(
            @RequestBody @Valid MealUpdateDto updateDto,
            @PathVariable String uuid) {

        return ResponseEntity.ok(mealService.updateMeal(updateDto, uuid));
    }

    @GetMapping("/meals/{uuid}")
    public ResponseEntity<MealReadDto> getMealByUuid(@PathVariable String uuid) {
        return ResponseEntity.ok(mealService.getMealByUuid(uuid));
    }

    @GetMapping("/meals")
    public ResponseEntity<List<MealReadDto>> getAllMeals() {
        return ResponseEntity.ok(mealService.getAllMeals());
    }

    @DeleteMapping("/meals/{uuid}")
    public ResponseEntity<ResponseMessageDto> deleteMeal(@PathVariable String uuid) {
        return ResponseEntity.ok(mealService.deleteMeal(uuid));
    }
}
