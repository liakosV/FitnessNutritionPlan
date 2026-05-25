package com.project.fitness_nutrition_plan.api;

import com.project.fitness_nutrition_plan.authentication.AuthenticationService;
import com.project.fitness_nutrition_plan.dto.authentication.AuthenticationRequestDto;
import com.project.fitness_nutrition_plan.dto.authentication.AuthenticationResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthRestController {

    private final AuthenticationService authenticationService;

    @PostMapping
    public ResponseEntity<AuthenticationResponseDto> authenticate(@RequestBody AuthenticationRequestDto dto) {
        AuthenticationResponseDto responseDto = authenticationService.authenticate(dto);
        return ResponseEntity.ok(responseDto);
    }
}
