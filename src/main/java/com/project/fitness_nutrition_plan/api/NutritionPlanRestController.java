package com.project.fitness_nutrition_plan.api;

import com.project.fitness_nutrition_plan.dto.nutrition_plan.NutritionPlanInsertDto;
import com.project.fitness_nutrition_plan.dto.nutrition_plan.NutritionPlanReadDto;
import com.project.fitness_nutrition_plan.dto.nutrition_plan.NutritionPlanUpdateDto;
import com.project.fitness_nutrition_plan.dto.response.ResponseMessageDto;
import com.project.fitness_nutrition_plan.model.User;
import com.project.fitness_nutrition_plan.service.NutritionPlanService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/nutrition-plans")
@RequiredArgsConstructor
public class NutritionPlanRestController {

    private final NutritionPlanService nutritionPlanService;

    @PostMapping
    public ResponseEntity<NutritionPlanReadDto> createNutritionPlan(
            @RequestBody @Valid NutritionPlanInsertDto insertDto,
            @AuthenticationPrincipal User loggedInUser) {

        NutritionPlanReadDto nutritionPlanReadDto = nutritionPlanService.createNutritionPlan(insertDto, loggedInUser.getUsername());

        return ResponseEntity.ok(nutritionPlanReadDto);
    }

    @PatchMapping("/{uuid}")
    public ResponseEntity<NutritionPlanReadDto> updateNutritionPlan(
            @PathVariable String uuid,
            @RequestBody NutritionPlanUpdateDto updateDto) {

        NutritionPlanReadDto nutritionPlanReadDto = nutritionPlanService.updateNutritionPlan(uuid, updateDto);

        return ResponseEntity.ok(nutritionPlanReadDto);
    }

    @GetMapping("/{uuid}")
    public ResponseEntity<NutritionPlanReadDto> getNutritionPlanByUuid(@PathVariable String uuid) {
        return ResponseEntity.ok(nutritionPlanService.getNutritionPlanByUuid(uuid));
    }

    @GetMapping
    public ResponseEntity<List<NutritionPlanReadDto>> getAllNutritionPlans() {
        return ResponseEntity.ok(nutritionPlanService.getAllNutritionPlans());
    }

    @DeleteMapping("/{uuid}")
    public ResponseEntity<ResponseMessageDto> deleteNutritionPlan(@PathVariable String uuid) {
        return ResponseEntity.ok(nutritionPlanService.deleteNutritionPlan(uuid));
    }
}
