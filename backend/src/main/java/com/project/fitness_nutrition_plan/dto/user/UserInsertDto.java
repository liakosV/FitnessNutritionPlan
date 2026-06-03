package com.project.fitness_nutrition_plan.dto.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserInsertDto {

    @NotBlank( message = "Username cannot be empty")
    private String username;

    @NotBlank( message = "Email cannot be empty")
    @Email( message = "Invalid Email")
    private String email;

    @NotBlank( message = "Password cannot be empty")
    @Pattern(regexp = "^(?=.*?[a-z])(?=.*?[A-Z])(?=.*?[0-9])(?=.*?[@#$%!^&*]).{8,}$", message = "Invalid Password")
    private String password;
}
