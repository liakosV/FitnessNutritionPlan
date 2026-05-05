package com.project.fitness_nutrition_plan.dto.progress_entry;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProgressEntryInsertDto {

    @NotNull(message = "Weight cannot be empty")
    @Positive(message = "Weight must be positive")
    private Double weight;

    @NotNull(message = "Body fat cannot be empty")
    @PositiveOrZero(message = "Body fat cannot be negative")
    private Double bodyFat;

    private String notes;
}
