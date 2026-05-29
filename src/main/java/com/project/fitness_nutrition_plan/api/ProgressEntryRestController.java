package com.project.fitness_nutrition_plan.api;

import com.project.fitness_nutrition_plan.dto.progress_entry.ProgressEntryInsertDto;
import com.project.fitness_nutrition_plan.dto.progress_entry.ProgressEntryReadDto;
import com.project.fitness_nutrition_plan.dto.response.ResponseMessageDto;
import com.project.fitness_nutrition_plan.service.ProgressEntryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ProgressEntryRestController {

    private final ProgressEntryService progressEntryService;

    @PostMapping("/users/{userUuid}/progress-entries")
    public ResponseEntity<ProgressEntryReadDto> createProgressEntry(
            @RequestBody @Valid ProgressEntryInsertDto insertDto,
            @PathVariable String userUuid) {

        return ResponseEntity.ok(progressEntryService.createProgressEntry(insertDto, userUuid));
    }

    @GetMapping("/users/{userUuid}/progress-entries")
    public ResponseEntity<List<ProgressEntryReadDto>> getProgressEntriesByUserUuid(
            @PathVariable String userUuid) {

        return ResponseEntity.ok(progressEntryService.getProgressEntriesByUserUuid(userUuid));
    }

    @DeleteMapping("/progress-entries/{uuid}")
    public ResponseEntity<ResponseMessageDto> deleteProgressEntry(@PathVariable String uuid) {
        return ResponseEntity.ok(progressEntryService.deleteProgressEntry(uuid));
    }
}
