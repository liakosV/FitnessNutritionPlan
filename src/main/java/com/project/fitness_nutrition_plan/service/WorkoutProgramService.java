package com.project.fitness_nutrition_plan.service;

import com.project.fitness_nutrition_plan.core.exception.AppObjectAccessDeniedException;
import com.project.fitness_nutrition_plan.core.exception.AppObjectAlreadyExistsException;
import com.project.fitness_nutrition_plan.core.exception.AppObjectInvalidArgumentException;
import com.project.fitness_nutrition_plan.core.exception.AppObjectNotFoundException;
import com.project.fitness_nutrition_plan.dto.response.ResponseMessageDto;
import com.project.fitness_nutrition_plan.dto.workout_program.WorkoutProgramInsertDto;
import com.project.fitness_nutrition_plan.dto.workout_program.WorkoutProgramReadDto;
import com.project.fitness_nutrition_plan.dto.workout_program.WorkoutProgramUpdateDto;
import com.project.fitness_nutrition_plan.mapper.WorkoutProgramMapper;
import com.project.fitness_nutrition_plan.model.User;
import com.project.fitness_nutrition_plan.model.WorkoutProgram;
import com.project.fitness_nutrition_plan.model.static_data.Role;
import com.project.fitness_nutrition_plan.repository.UserRepository;
import com.project.fitness_nutrition_plan.repository.WorkoutProgramRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service class responsible for managing workout programs, including creation, updating, retrieval, and deletion functionalities.
 */
@Service
@RequiredArgsConstructor
public class WorkoutProgramService {

    private final WorkoutProgramRepository workoutProgramRepository;
    private final UserRepository userRepository;
    private final WorkoutProgramMapper workoutProgramMapper;

    /**
     * Creates a new workout program and assigns it to a coach and optionally to a list of users.
     *
     * @param insertDto   a DTO containing the details of the workout program to create, including its name, description,
     *                    and the UUIDs of assigned users
     * @param coachUuid   the UUID of the coach who is creating the workout program
     * @return a DTO containing the details of the created workout program, including its ID, UUID, name, description,
     *         active status, coach details, and assigned user details
     * @throws AppObjectAlreadyExistsException if a workout program with the same name already exists
     * @throws AppObjectNotFoundException      if the coach or any assigned user does not exist
     * @throws AppObjectAccessDeniedException  if the given user is not a coach
     * @throws AppObjectInvalidArgumentException if any of the assigned users is not a client
     */
    @PreAuthorize("hasAuthority('ROLE_ADMIN') or (hasAuthority('ROLE_COACH') and principal.uuid == #coachUuid)")
    @Transactional
    public WorkoutProgramReadDto createWorkoutProgram(WorkoutProgramInsertDto insertDto, String coachUuid) {
        if (workoutProgramRepository.findByName(insertDto.getName()).isPresent()) {
            throw new AppObjectAlreadyExistsException("WORKOUT_PROGRAM", "Workout program name already exists");
        }

        User coach = userRepository.findByUuid(coachUuid)
                .orElseThrow(() -> new AppObjectNotFoundException("USER", "User not found"));

        if (coach.getRole() != Role.ROLE_COACH && coach.getRole() != Role.ROLE_ADMIN) {
            throw new AppObjectAccessDeniedException("COACH", "Only coaches and admins can create workout programs");
        }

        List<User> assignedUsers = insertDto.getAssignedUserUuids() == null
                ? List.of()
                : insertDto.getAssignedUserUuids().stream()
                .map(uuid -> userRepository.findByUuid(uuid)
                        .orElseThrow(() -> new AppObjectNotFoundException("USER", "Assigned user not found")))
                .toList();

        assignedUsers.forEach(user -> {
            if (user.getRole() != Role.ROLE_USER) {
                throw new AppObjectInvalidArgumentException("USER", "Assigned users must be clients");
            }
        });

        WorkoutProgram workoutProgram = workoutProgramMapper.mapToWorkoutProgram(insertDto, assignedUsers, coach);
        workoutProgram.setActive(true);

        return workoutProgramMapper.mapToWorkoutProgramReadDto(workoutProgramRepository.save(workoutProgram));
    }

    /**
     * Updates an existing workout program using the provided update data and unique identifier.
     *
     * @param updateDto the data transfer object containing the updated fields of the workout program
     * @param workoutProgramUuid the unique identifier of the workout program to be updated
     * @return a {@link WorkoutProgramReadDto} containing the updated details of the workout program
     * @throws AppObjectAlreadyExistsException if the workout program name already exists
     * @throws AppObjectNotFoundException if the workout program with the specified UUID is not found
     */
    @PreAuthorize("hasAuthority('ROLE_ADMIN') or @workoutProgramSecurity.isCoachOwner(#workoutProgramUuid, principal.uuid)")
    @Transactional
    public WorkoutProgramReadDto updateWorkoutProgram(WorkoutProgramUpdateDto updateDto, String workoutProgramUuid) {
        WorkoutProgram workoutProgram = getWorkoutProgramByUuid(workoutProgramUuid);

        if (updateDto.getName() != null &&
        !workoutProgram.getName().equals(updateDto.getName()) &&
        workoutProgramRepository.existsByName(updateDto.getName())) {
            throw new AppObjectAlreadyExistsException("WORKOUT_PROGRAM", "Workout program name already exists");
        }

        workoutProgramMapper.updateWorkoutProgramFromDto(updateDto, workoutProgram);
        return workoutProgramMapper.mapToWorkoutProgramReadDto(workoutProgram);
    }

    /**
     * Retrieves a list of all workout programs in the system.
     *
     * @return a list of {@link WorkoutProgramReadDto} representing all workout programs
     */
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @Transactional(readOnly = true)
    public List<WorkoutProgramReadDto> getAllWorkoutPrograms() {
        return workoutProgramRepository.findAll()
                .stream()
                .map(workoutProgramMapper::mapToWorkoutProgramReadDto)
                .toList();
    }

    /**
     * Retrieves a list of workout programs associated with a specific coach.
     *
     * @param coachUuid the unique identifier of the coach whose workout programs are to be retrieved
     * @return a list of {@link WorkoutProgramReadDto} containing the workout program details for the specified coach
     */
    @PreAuthorize("hasAuthority('ROLE_ADMIN') or principal.uuid == #coachUuid")
    @Transactional(readOnly = true)
    public List<WorkoutProgramReadDto> getWorkoutProgramsByCoach(String coachUuid) {
        User coach = userRepository.findByUuid(coachUuid)
                .orElseThrow(() -> new AppObjectNotFoundException("USER", "Coach not found"));

        if (coach.getRole() != Role.ROLE_COACH && coach.getRole() != Role.ROLE_ADMIN) {
            throw new AppObjectInvalidArgumentException("USER", "Selected user is not a coach or admin");
        }

        return workoutProgramRepository.findByCoachUuid(coach.getUuid())
                .stream()
                .map(workoutProgramMapper::mapToWorkoutProgramReadDto)
                .toList();
    }

    /**
     * Deletes a workout program based on the provided UUID.
     *
     * @param workoutProgramUuid the unique identifier of the workout program to be deleted
     * @return a ResponseMessageDto indicating the outcome of the delete operation
     */
    @PreAuthorize("hasAuthority('ROLE_ADMIN') or @workoutProgramSecurity.isCoachOwner(#workoutProgramUuid, principal.uuid)")
    @Transactional
    public ResponseMessageDto deleteWorkoutProgram(String workoutProgramUuid) {
        WorkoutProgram workoutProgram = getWorkoutProgramByUuid(workoutProgramUuid);

        workoutProgramRepository.delete(workoutProgram);

        return new ResponseMessageDto("WORKOUT_PROGRAM_DELETED", "Workout program deleted successfully");
    }

    /**
     * Retrieves a WorkoutProgram entity by its UUID.
     *
     * @param WorkoutProgramUuid the unique identifier of the workout program
     * @return the WorkoutProgram entity corresponding to the provided UUID
     * @throws AppObjectNotFoundException if no workout program is found with the specified UUID
     */
    private WorkoutProgram getWorkoutProgramByUuid(String WorkoutProgramUuid) {
        return workoutProgramRepository.findByUuid(WorkoutProgramUuid)
                .orElseThrow(() -> new AppObjectNotFoundException("WORKOUT_PROGRAM", "Workout program not found"));
    }
}
