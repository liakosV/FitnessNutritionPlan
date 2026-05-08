package com.project.fitness_nutrition_plan.mapper;

import com.project.fitness_nutrition_plan.dto.workout_program.WorkoutProgramInsertDto;
import com.project.fitness_nutrition_plan.dto.workout_program.WorkoutProgramReadDto;
import com.project.fitness_nutrition_plan.dto.workout_program.WorkoutProgramUpdateDto;
import com.project.fitness_nutrition_plan.model.User;
import com.project.fitness_nutrition_plan.model.WorkoutProgram;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Responsible for mapping entities and DTOs related to WorkoutProgram.
 */
@Component
public class WorkoutProgramMapper {

    /**
     * Maps a {@link WorkoutProgram} entity to a {@link WorkoutProgramReadDto}.
     *
     * @param workoutProgram the WorkoutProgram entity to be mapped
     * @return a WorkoutProgramReadDto containing the mapped data
     */
    public WorkoutProgramReadDto mapToWorkoutProgramReadDto(WorkoutProgram workoutProgram) {
        var dto = new WorkoutProgramReadDto();
        List<User> assignedUsers = workoutProgram.getAssignedUsers();

        dto.setId(workoutProgram.getId());
        dto.setUuid(workoutProgram.getUuid());
        dto.setName(workoutProgram.getName());
        dto.setDescription(workoutProgram.getDescription());
        dto.setActive(workoutProgram.isActive());

        dto.setCoachId(workoutProgram.getCoach().getId());
        dto.setCoachUsername(workoutProgram.getCoach().getUsername());

        dto.setAssignedUserIds(assignedUsers == null
                ? List.of()
                : assignedUsers.stream()
                .map(User::getId)
                .toList());

        dto.setAssignedUsernames(assignedUsers == null
                ? List.of()
                : assignedUsers.stream()
                .map(User::getUsername)
                .toList());

        return dto;
    }

    /**
     * Maps a WorkoutProgramInsertDto and associated users and coach to a WorkoutProgram entity.
     *
     * @param dto  the WorkoutProgramInsertDto containing the name and description of the workout program
     * @param users the list of users to be assigned to the workout program
     * @param coach the coach associated with the workout program
     * @return a WorkoutProgram entity populated with data from the provided DTO and input parameters
     */
    public WorkoutProgram mapToWorkoutProgram(WorkoutProgramInsertDto dto, List<User> users, User coach) {
        WorkoutProgram workoutProgram = new WorkoutProgram();

        workoutProgram.setName(dto.getName());
        workoutProgram.setDescription(dto.getDescription());

        workoutProgram.setCoach(coach);

        workoutProgram.setAssignedUsers(users);

        return workoutProgram;
    }

    /**
     * Updates the fields of the given WorkoutProgram entity using the non-null fields
     * from the provided WorkoutProgramUpdateDto object.
     *
     * @param dto the WorkoutProgramUpdateDto containing updated values
     * @param workoutProgram the WorkoutProgram entity to be updated
     */
    public void updateWorkoutProgramFromDto(WorkoutProgramUpdateDto dto, WorkoutProgram workoutProgram) {
        if (dto.getName() != null) {
            workoutProgram.setName(dto.getName());
        }

        if (dto.getDescription() != null) {
            workoutProgram.setDescription(dto.getDescription());
        }

        if (dto.getActive() != null) {
            workoutProgram.setActive(dto.getActive());
        }
    }
}
