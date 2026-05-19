package com.project.fitness_nutrition_plan.dto.message;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MessageInsertDto {

    @NotBlank(message = "Content cannot be empty")
    private String content;

    @NotNull(message = "Receiver uuid cannot be empty")
    private String receiverUuid;
}
