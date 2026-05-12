package com.project.fitness_nutrition_plan.service;

import com.project.fitness_nutrition_plan.core.exception.AppObjectAccessDeniedException;
import com.project.fitness_nutrition_plan.core.exception.AppObjectInvalidArgumentException;
import com.project.fitness_nutrition_plan.core.exception.AppObjectNotFoundException;
import com.project.fitness_nutrition_plan.dto.nutrition_plan.NutritionPlanInsertDto;
import com.project.fitness_nutrition_plan.dto.nutrition_plan.NutritionPlanReadDto;
import com.project.fitness_nutrition_plan.dto.nutrition_plan.NutritionPlanUpdateDto;
import com.project.fitness_nutrition_plan.dto.response.ResponseMessageDto;
import com.project.fitness_nutrition_plan.mapper.NutritionPlanMapper;
import com.project.fitness_nutrition_plan.model.NutritionPlan;
import com.project.fitness_nutrition_plan.model.User;
import com.project.fitness_nutrition_plan.model.static_data.Role;
import com.project.fitness_nutrition_plan.repository.NutritionPlanRepository;
import com.project.fitness_nutrition_plan.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NutritionPlanService {

    private final NutritionPlanRepository nutritionPlanRepository;
    private final NutritionPlanMapper nutritionPlanMapper;
    private final UserRepository userRepository;

    @Transactional
    public NutritionPlanReadDto createNutritionPlan(NutritionPlanInsertDto insertDto, String coachUsername) {
        User coach = userRepository.findByUsername(coachUsername)
                .orElseThrow(() -> new AppObjectNotFoundException("USER", "Coach not found"));

        User assignedUser = userRepository.findById(insertDto.getAssignedUserId())
                .orElseThrow(() -> new AppObjectNotFoundException("USER", "Assigned user not found"));

        if (coach.getRole() != Role.ROLE_COACH) {
            throw new AppObjectAccessDeniedException("COACH", "Only coaches can create nutrition plans");
        }

        if (assignedUser.getRole() != Role.ROLE_USER) {
            throw new AppObjectInvalidArgumentException("USER", "Selected assigned user is not a client");
        }

        NutritionPlan nutritionPlan = nutritionPlanMapper.mapToNutritionPlan(insertDto, coach, assignedUser);
        return nutritionPlanMapper.mapToNutritionPlanReadDto(nutritionPlanRepository.save(nutritionPlan));
    }

    @Transactional
    public NutritionPlanReadDto updateNutritionPlan(String uuid, NutritionPlanUpdateDto updateDto) {
        NutritionPlan nutritionPlan = nutritionPlanRepository.findByUuid(uuid)
                .orElseThrow(() -> new AppObjectNotFoundException("NUTRITION_PLAN", "Nutrition plan not found"));

        nutritionPlanMapper.updateNutritionPlanFromDto(updateDto, nutritionPlan);
        return nutritionPlanMapper.mapToNutritionPlanReadDto(nutritionPlan);
    }

    @Transactional(readOnly = true)
    public NutritionPlanReadDto getNutritionPlanByUuid(String uuid) {
        return nutritionPlanRepository.findByUuid(uuid)
                .map(nutritionPlanMapper::mapToNutritionPlanReadDto)
                .orElseThrow(() -> new AppObjectNotFoundException("NUTRITION_PLAN", "Nutrition plan not found"));
    }

    @Transactional(readOnly = true)
    public List<NutritionPlanReadDto> getAllNutritionPlans() {
        return nutritionPlanRepository.findAll().stream()
                .map(nutritionPlanMapper::mapToNutritionPlanReadDto)
                .toList();
    }

    @Transactional
    public ResponseMessageDto deleteNutritionPlan(String uuid) {
        NutritionPlan nutritionPlan = nutritionPlanRepository.findByUuid(uuid)
                .orElseThrow(() -> new AppObjectNotFoundException("NUTRITION_PLAN", "Nutrition plan not found"));

        nutritionPlanRepository.delete(nutritionPlan);

        return new ResponseMessageDto("NUTRITION_PLAN_DELETED", "Nutrition plan deleted successfully");
    }
}
