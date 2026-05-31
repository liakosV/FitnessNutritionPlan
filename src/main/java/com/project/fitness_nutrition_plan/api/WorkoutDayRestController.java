package com.project.fitness_nutrition_plan.api;

import com.project.fitness_nutrition_plan.dto.response.ResponseMessageDto;
import com.project.fitness_nutrition_plan.dto.workout_day.WorkoutDayInsertDto;
import com.project.fitness_nutrition_plan.dto.workout_day.WorkoutDayReadDto;
import com.project.fitness_nutrition_plan.dto.workout_day.WorkoutDayUpdateDto;
import com.project.fitness_nutrition_plan.service.WorkoutDaysService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class WorkoutDayRestController {

    private final WorkoutDaysService workoutDaysService;

    @PostMapping("/workout-days")
    public ResponseEntity<WorkoutDayReadDto> createWorkoutDay(@RequestBody @Valid WorkoutDayInsertDto insertDto) {

        WorkoutDayReadDto workoutDayReadDto = workoutDaysService.createWorkoutDay(insertDto);

        return ResponseEntity.ok(workoutDayReadDto);
    }

    @PatchMapping("/workout-days/{uuid}")
    public ResponseEntity<WorkoutDayReadDto> updateWorkoutDay(
            @RequestBody @Valid WorkoutDayUpdateDto workoutDayUpdateDto,
            @PathVariable String uuid) {

        WorkoutDayReadDto workoutDayReadDto = workoutDaysService.updateWorkoutDay(workoutDayUpdateDto, uuid);

        return ResponseEntity.ok(workoutDayReadDto);
    }

    @GetMapping("workout/programs/{workoutProgramUuid}/workout-days")
    public ResponseEntity<List<WorkoutDayReadDto>> getWorkoutDaysByWorkoutProgram(@PathVariable String workoutProgramUuid) {
        return ResponseEntity.ok(workoutDaysService.getWorkoutDaysByWorkoutProgram(workoutProgramUuid));
    }

    @DeleteMapping("/workout-days/{uuid}")
    public ResponseEntity<ResponseMessageDto> deleteWorkoutDay(@PathVariable String uuid) {
        return ResponseEntity.ok(workoutDaysService.deleteWorkoutDay(uuid));
    }


}
