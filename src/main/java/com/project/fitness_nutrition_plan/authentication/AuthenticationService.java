package com.project.fitness_nutrition_plan.authentication;

import com.project.fitness_nutrition_plan.dto.authentication.AuthenticationRequestDto;
import com.project.fitness_nutrition_plan.dto.authentication.AuthenticationResponseDto;
import com.project.fitness_nutrition_plan.model.User;
import com.project.fitness_nutrition_plan.security.jwt.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthenticationResponseDto authenticate(AuthenticationRequestDto dto) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(dto.username(), dto.password()));

        User user = (User) authentication.getPrincipal();
        String token = jwtService.generateToken(user);

        return new AuthenticationResponseDto(token);
    }
}
