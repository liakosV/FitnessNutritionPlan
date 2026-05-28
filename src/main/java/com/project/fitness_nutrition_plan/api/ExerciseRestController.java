package com.project.fitness_nutrition_plan.api;

import com.project.fitness_nutrition_plan.dto.exercise.ExerciseInsertDto;
import com.project.fitness_nutrition_plan.dto.exercise.ExerciseReadDto;
import com.project.fitness_nutrition_plan.dto.exercise.ExerciseUpdateDto;
import com.project.fitness_nutrition_plan.dto.response.ResponseMessageDto;
import com.project.fitness_nutrition_plan.service.ExerciseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ExerciseRestController {

    private final ExerciseService exerciseService;

    @PostMapping("/workout/days/{workoutDayUuid}/exercises")
    public ResponseEntity<ExerciseReadDto> createExercise(
            @RequestBody @Valid ExerciseInsertDto insertDto,
            @PathVariable String workoutDayUuid) {
        ExerciseReadDto exerciseReadDto = exerciseService.createExercise(insertDto, workoutDayUuid);

        return ResponseEntity.ok(exerciseReadDto);
    }

    @GetMapping("/workout/days/{workoutDayUuid}/exercises")
    public ResponseEntity<List<ExerciseReadDto>> getExercisesByWorkoutDay(
            @PathVariable String workoutDayUuid) {

        return ResponseEntity.ok(exerciseService.getExerciseByWorkoutDay(workoutDayUuid));
    }

    @PatchMapping("/exercises/{exerciseUuid}")
    public ResponseEntity<ExerciseReadDto> updateExercise(
            @PathVariable String exerciseUuid,
            @RequestBody @Valid ExerciseUpdateDto updateDto) {

        return ResponseEntity.ok(exerciseService.updateExercise(updateDto, exerciseUuid));
    }

    @DeleteMapping("/exercises/{exerciseUuid}")
    public ResponseEntity<ResponseMessageDto> deleteExercise(
            @PathVariable String exerciseUuid) {

        return ResponseEntity.ok(exerciseService.deleteExercise(exerciseUuid));
    }

}
