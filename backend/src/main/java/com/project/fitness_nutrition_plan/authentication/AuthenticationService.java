package com.project.fitness_nutrition_plan.authentication;

import com.project.fitness_nutrition_plan.core.exception.AppObjectUnauthorizedException;
import com.project.fitness_nutrition_plan.dto.authentication.AuthenticationRequestDto;
import com.project.fitness_nutrition_plan.dto.authentication.AuthenticationResponseDto;
import com.project.fitness_nutrition_plan.model.RefreshToken;
import com.project.fitness_nutrition_plan.model.User;
import com.project.fitness_nutrition_plan.repository.RefreshTokenRepository;
import com.project.fitness_nutrition_plan.security.jwt.JwtService;
import com.project.fitness_nutrition_plan.service.RefreshTokenService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;
    private final AuthenticationManager authenticationManager;

    public AuthenticationResponseDto authenticate(AuthenticationRequestDto dto) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(dto.username(), dto.password()));

        User user = (User) authentication.getPrincipal();
        String accessToken = jwtService.generateToken(user);
        String refreshToken = refreshTokenService.createRefreshToken(user);

        return new AuthenticationResponseDto(accessToken, refreshToken);
    }

    public AuthenticationResponseDto refresh(String refreshToken) {
        RefreshTokenRotation rotation = refreshTokenService.rotateRefreshToken(refreshToken);

        String accessToken = jwtService.generateToken(rotation.user());

        return new AuthenticationResponseDto(
                accessToken,
                rotation.refreshToken()
        );
    }
}
