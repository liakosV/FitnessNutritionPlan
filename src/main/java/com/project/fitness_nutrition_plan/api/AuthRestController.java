package com.project.fitness_nutrition_plan.api;

import com.project.fitness_nutrition_plan.authentication.AuthenticationService;
import com.project.fitness_nutrition_plan.dto.authentication.AuthenticationRequestDto;
import com.project.fitness_nutrition_plan.dto.authentication.AuthenticationResponseDto;
import com.project.fitness_nutrition_plan.dto.user.UserInsertDto;
import com.project.fitness_nutrition_plan.dto.user.UserReadDto;
import com.project.fitness_nutrition_plan.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthRestController {

    private final AuthenticationService authenticationService;
    private final UserService userService;

    @PostMapping("/login")
    public ResponseEntity<AuthenticationResponseDto> authenticate(@RequestBody AuthenticationRequestDto dto) {
        AuthenticationResponseDto responseDto = authenticationService.authenticate(dto);
        return ResponseEntity.ok(responseDto);
    }

    @PostMapping("/register")
    public ResponseEntity<UserReadDto> registerUser(@Valid @RequestBody UserInsertDto insertDto) {
        UserReadDto userReadDto = userService.saveUser(insertDto);

        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("api/user/{uuid}")
                .buildAndExpand(userReadDto.getUuid())
                .toUri();

        return ResponseEntity
                .created(location)
                .body(userReadDto);
    }
}
