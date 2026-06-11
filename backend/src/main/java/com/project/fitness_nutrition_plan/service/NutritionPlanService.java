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
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service for managing nutrition plans, including creation, retrieval, updating, and deletion.
 */
@Service
@RequiredArgsConstructor
public class NutritionPlanService {

    private final NutritionPlanRepository nutritionPlanRepository;
    private final NutritionPlanMapper nutritionPlanMapper;
    private final UserRepository userRepository;

    /**
     * Creates a new nutrition plan and assigns it to a specific user.
     *
     * @param insertDto the data transfer object containing details such as title, description, active status, and the ID of the assigned user
     * @param coachUsername the username of the coach creating the nutrition plan
     * @return a NutritionPlanReadDto containing the details of the newly created nutrition plan
     * @throws AppObjectNotFoundException if the coach or assigned user is not found
     * @throws AppObjectAccessDeniedException if the provided coach does not have the ROLE_COACH
     * @throws AppObjectInvalidArgumentException if the assigned user does not have the ROLE_USER
     */
    @PreAuthorize("hasAuthority('ROLE_ADMIN') or (hasAuthority('ROLE_COACH') and authentication.name == #coachUsername)")
    @Transactional
    public NutritionPlanReadDto createNutritionPlan(NutritionPlanInsertDto insertDto, String coachUsername) {
        User coach = userRepository.findByUsername(coachUsername)
                .orElseThrow(() -> new AppObjectNotFoundException("USER", "Coach not found"));

        User assignedUser = userRepository.findByUuid(insertDto.getAssignedUserUuid())
                .orElseThrow(() -> new AppObjectNotFoundException("USER", "Assigned user not found"));

        if (coach.getRole() != Role.ROLE_COACH && coach.getRole() != Role.ROLE_ADMIN) {
            throw new AppObjectAccessDeniedException("COACH", "Only coaches and admins can create nutrition plans");
        }

        if (assignedUser.getRole() != Role.ROLE_USER) {
            throw new AppObjectInvalidArgumentException("USER", "Selected assigned user is not a client");
        }

        NutritionPlan nutritionPlan = nutritionPlanMapper.mapToNutritionPlan(insertDto, coach, assignedUser);
        return nutritionPlanMapper.mapToNutritionPlanReadDto(nutritionPlanRepository.save(nutritionPlan));
    }

    /**
     * Updates an existing nutrition plan based on the provided UUID and update data.
     *
     * @param uuid the unique identifier of the nutrition plan to be updated
     * @param updateDto the data transfer object containing updated nutrition plan details
     * @return the updated nutrition plan as a NutritionPlanReadDto
     * @throws AppObjectNotFoundException if the nutrition plan with the specified UUID does not exist
     */
    @PreAuthorize("hasAuthority('ROLE_ADMIN') or @nutritionPlanSecurity.isCoachOwner(#uuid, principal.uuid)")
    @Transactional
    public NutritionPlanReadDto updateNutritionPlan(String uuid, NutritionPlanUpdateDto updateDto) {
        NutritionPlan nutritionPlan = nutritionPlanRepository.findByUuid(uuid)
                .orElseThrow(() -> new AppObjectNotFoundException("NUTRITION_PLAN", "Nutrition plan not found"));

        nutritionPlanMapper.updateNutritionPlanFromDto(updateDto, nutritionPlan);
        return nutritionPlanMapper.mapToNutritionPlanReadDto(nutritionPlan);
    }

    /**
     * Retrieves a NutritionPlanReadDto by its unique identifier (UUID).
     *
     * @param uuid the unique identifier of the nutrition plan
     * @return the NutritionPlanReadDto corresponding to the given UUID
     * @throws AppObjectNotFoundException if no nutrition plan is found with the provided UUID
     */
    @PreAuthorize("hasAuthority('ROLE_ADMIN') or @nutritionPlanSecurity.canAccessNutritionPlan(#uuid, principal.uuid)")
    @Transactional(readOnly = true)
    public NutritionPlanReadDto getNutritionPlanByUuid(String uuid) {
        return nutritionPlanRepository.findByUuid(uuid)
                .map(nutritionPlanMapper::mapToNutritionPlanReadDto)
                .orElseThrow(() -> new AppObjectNotFoundException("NUTRITION_PLAN", "Nutrition plan not found"));
    }

    /**
     * Retrieves all nutrition plans available in the system.
     *
     * @return a list of NutritionPlanReadDto objects representing the nutrition plans
     */
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @Transactional(readOnly = true)
    public List<NutritionPlanReadDto> getAllNutritionPlans() {
        return nutritionPlanRepository.findAll().stream()
                .map(nutritionPlanMapper::mapToNutritionPlanReadDto)
                .toList();
    }

    @PreAuthorize("isAuthenticated() and principal.uuid == #userUuid")
    @Transactional(readOnly = true)
    public List<NutritionPlanReadDto> getAccessibleNutritionPlans(String userUuid) {
        User user = userRepository.findByUuid(userUuid)
                .orElseThrow(() -> new AppObjectNotFoundException("USER", "User not found"));

        List<NutritionPlan> nutritionPlans = switch (user.getRole()) {
            case ROLE_ADMIN -> nutritionPlanRepository.findAll();
            case ROLE_COACH -> nutritionPlanRepository.findByCoachId(user.getId());
            case ROLE_USER -> nutritionPlanRepository.findByAssignedUserUuid(user.getUuid());
        };

        return nutritionPlans.stream()
                .map(nutritionPlanMapper::mapToNutritionPlanReadDto)
                .toList();
    }

    /**
     * Deletes a nutrition plan identified by its UUID.
     *
     * @param uuid the unique identifier of the nutrition plan to delete
     * @return a ResponseMessageDto containing a confirmation code and message
     * @throws AppObjectNotFoundException if the nutrition plan with the specified UUID is not found
     */
    @PreAuthorize("hasAuthority('ROLE_ADMIN') or @nutritionPlanSecurity.isCoachOwner(#uuid, principal.uuid)")
    @Transactional
    public ResponseMessageDto deleteNutritionPlan(String uuid) {
        NutritionPlan nutritionPlan = nutritionPlanRepository.findByUuid(uuid)
                .orElseThrow(() -> new AppObjectNotFoundException("NUTRITION_PLAN", "Nutrition plan not found"));

        nutritionPlanRepository.delete(nutritionPlan);

        return new ResponseMessageDto("NUTRITION_PLAN_DELETED", "Nutrition plan deleted successfully");
    }
}
