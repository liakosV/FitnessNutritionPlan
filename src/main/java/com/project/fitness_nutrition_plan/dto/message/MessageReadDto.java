package com.project.fitness_nutrition_plan.dto.message;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MessageReadDto {

//    private Long id;
    private String uuid;
    private String content;
    private LocalDateTime timestamp;

    private String senderUuid;
    private String senderUsername;

    private String receiverUuid;
    private String receiverUsername;
}
