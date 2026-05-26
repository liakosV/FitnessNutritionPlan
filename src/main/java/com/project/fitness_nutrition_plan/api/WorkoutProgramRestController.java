package com.project.fitness_nutrition_plan.api;

import com.project.fitness_nutrition_plan.dto.response.ResponseMessageDto;
import com.project.fitness_nutrition_plan.dto.workout_program.WorkoutProgramInsertDto;
import com.project.fitness_nutrition_plan.dto.workout_program.WorkoutProgramReadDto;
import com.project.fitness_nutrition_plan.dto.workout_program.WorkoutProgramUpdateDto;
import com.project.fitness_nutrition_plan.model.User;
import com.project.fitness_nutrition_plan.service.WorkoutProgramService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workout/programs")
@RequiredArgsConstructor
public class WorkoutProgramRestController {

    private final WorkoutProgramService workoutProgramService;

    @PostMapping
    public ResponseEntity<WorkoutProgramReadDto> createProgram(
            @Valid @RequestBody WorkoutProgramInsertDto insertDto,
            @AuthenticationPrincipal User loggedInUser) {

        WorkoutProgramReadDto workoutProgramReadDto = workoutProgramService.createWorkoutProgram(insertDto, loggedInUser.getUuid());

        return ResponseEntity.ok(workoutProgramReadDto);
    }

    @PatchMapping("/{programUuid}")
    public ResponseEntity<WorkoutProgramReadDto> updateProgram(
            @RequestBody @Valid WorkoutProgramUpdateDto updateDto,
            @PathVariable String programUuid) {

        WorkoutProgramReadDto workoutProgramReadDto = workoutProgramService.updateWorkoutProgram(updateDto, programUuid);

        return ResponseEntity.ok(workoutProgramReadDto);
    }

    @DeleteMapping("{programUuid}")
    public ResponseEntity<ResponseMessageDto> deleteProgram(@PathVariable String programUuid) {
        return ResponseEntity.ok(workoutProgramService.deleteWorkoutProgram(programUuid));
    }

    @GetMapping
    public ResponseEntity<List<WorkoutProgramReadDto>> getAllPrograms() {
        return ResponseEntity.ok(workoutProgramService.getAllWorkoutPrograms());
    }

    @GetMapping("/coach/{coachUuid}")
    public ResponseEntity<List<WorkoutProgramReadDto>> getProgramsByCoach(@PathVariable String coachUuid) {
        return ResponseEntity.ok(workoutProgramService.getWorkoutProgramsByCoach(coachUuid));
    }

    @GetMapping("/my")
    public ResponseEntity<List<WorkoutProgramReadDto>> getMyPrograms(@AuthenticationPrincipal User loggedInUser) {
        return ResponseEntity.ok(workoutProgramService.getWorkoutProgramsByCoach(loggedInUser.getUuid()));
    }
}
