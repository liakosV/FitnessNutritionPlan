package com.project.fitness_nutrition_plan.dto.message;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MessageReadDto {

    private Long id;
    private String content;
    private Long senderId;
    private Long receiverId;
}
