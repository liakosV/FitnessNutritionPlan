package com.project.fitness_nutrition_plan.dto.user;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserReadDto {

//    private Long id;
    private String uuid;
    private String username;
    private String email;
    private String role;
}
