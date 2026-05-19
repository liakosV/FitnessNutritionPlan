package com.project.fitness_nutrition_plan.dto.progress_entry;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProgressEntryReadDto {

    private Long id;
    private String uuid;
    private Double weight;
    private Double bodyFat;
    private String notes;
    private LocalDate date;

    private Long userId;
    private String username;
}
